-- Create predictions table with user association
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_filename TEXT NOT NULL,
  predicted_class TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  grad_cam_data JSONB,
  class_probabilities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for predictions
CREATE POLICY "Users can view their own predictions" ON predictions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions" ON predictions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions" ON predictions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" ON predictions
  FOR DELETE
  USING (auth.uid() = user_id);
