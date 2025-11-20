import sys
import json
import base64
import io
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
import cv2

# Configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
CLASSES = ["glioma", "meningioma", "notumor", "pituitary"]
MODEL_PATH = "best_efficientnet.pth"

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        target_layer.register_forward_hook(self.forward_hook)
        target_layer.register_backward_hook(self.backward_hook)
    
    def forward_hook(self, module, inp, output):
        self.activations = output
    
    def backward_hook(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
    
    def generate(self, input_tensor, class_idx=None):
        self.model.zero_grad()
        output = self.model(input_tensor)
        
        if class_idx is None:
            class_idx = torch.argmax(output)
        
        class_score = output[:, class_idx]
        class_score.backward(retain_graph=True)
        
        gradients = self.gradients
        activations = self.activations
        
        weights = gradients.mean(dim=[2, 3], keepdim=True)
        cam = (weights * activations).sum(dim=1).squeeze()
        
        cam = torch.relu(cam)
        cam -= cam.min()
        cam /= cam.max() + 1e-8
        
        return cam.detach().cpu().numpy(), output.detach().cpu().numpy()[0]

def build_efficientnet_b0(num_classes: int, pretrained: bool = True):
    model = models.efficientnet_b0(pretrained=pretrained)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2, inplace=True),
        nn.Linear(in_features, num_classes)
    )
    return model

def predict(image_base64):
    # Load model
    model = build_efficientnet_b0(4, pretrained=True)
    try:
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
        if "module." in list(state_dict.keys())[0]:
            new_state_dict = {}
            for k, v in state_dict.items():
                new_state_dict[k.replace("module.", "")] = v
            state_dict = new_state_dict
        model.load_state_dict(state_dict)
    except:
        pass  # Use pretrained weights if model file not found
    
    model.eval()
    model.to(DEVICE)
    
    # Image transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    # Decode image
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    
    # Process image
    tensor = transform(image).unsqueeze(0).to(DEVICE)
    
    # Grad-CAM
    target_layer = model.features[-1]
    gradcam = GradCAM(model, target_layer)
    heatmap, probs = gradcam.generate(tensor)

    # Heatmap overlay base64
    heatmap_image_base64 = create_heatmap_overlay(heatmap, image)
    
    # Results
    pred_idx = np.argmax(probs)
    pred_label = CLASSES[pred_idx]
    pred_conf = float(probs[pred_idx])
    
    # Prepare response
    result = {
        "predicted_class": pred_label,
        "confidence": pred_conf,
        "class_probabilities": {
            CLASSES[i]: float(probs[i]) for i in range(len(CLASSES))
        },
        # "grad_cam_data": heatmap.tolist()
        "grad_cam_image": heatmap_image_base64
    }
    
    return result

def create_heatmap_overlay(heatmap, image):
    img_np = np.array(image)
    heatmap_resized = cv2.resize(heatmap, (img_np.shape[1], img_np.shape[0]))
    heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    superimposed = cv2.addWeighted(img_np, 0.6, heatmap_color, 0.4, 0)

    # Convert to base64
    _, buffer = cv2.imencode(".png", superimposed)
    base64_image = base64.b64encode(buffer).decode("utf-8")
    return base64_image


if __name__ == "__main__":
    image_base64 = sys.argv[1]
    result = predict(image_base64)
    print(json.dumps(result))
