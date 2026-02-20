-- Add chart_data column to store structured chart information for Writing Task 1 exercises
ALTER TABLE ielts_lover_v1.exercises
ADD COLUMN chart_data JSONB DEFAULT NULL;

COMMENT ON COLUMN ielts_lover_v1.exercises.chart_data IS 'Structured chart data for Task 1 exercises (labels, datasets, chart type). Used as context during AI evaluation.';

-- Seed chart_image_analysis feature pricing (5 credits per analysis)
INSERT INTO
    ielts_lover_v1.feature_pricing (feature_key, cost_per_unit)
VALUES ('chart_image_analysis', 5)
ON CONFLICT (feature_key) DO
UPDATE
SET
    cost_per_unit = EXCLUDED.cost_per_unit;