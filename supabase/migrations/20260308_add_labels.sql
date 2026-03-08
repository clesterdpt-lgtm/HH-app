-- Add labels array column to notes for tagging (e.g. diagnoses, initials)
ALTER TABLE notes ADD COLUMN labels TEXT[] DEFAULT '{}';
