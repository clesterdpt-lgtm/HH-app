import re

with open('./app/index.html', 'r') as f:
    content = f.read()

exercises_block = re.search(r'const BUILTIN_EXERCISES = \[(.*?)\];', content, re.DOTALL)
if exercises_block:
    exercises_str = exercises_block.group(1)

    # Extract names and instructions
    # Each exercise is a dictionary-like string, let's extract name and instructions
    exercises = re.findall(r"name:\s*'(.*?)'.*?instructions:\s*'(.*?)'", exercises_str, re.DOTALL)

    for name, instructions in exercises:
        print(f"- **{name}**: {instructions}")
else:
    print("Could not find BUILTIN_EXERCISES block.")
