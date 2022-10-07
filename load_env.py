import os
import sys

def parse_env_keys(file_name):
  with open(file_name, 'r') as file:
    data = file.read()
    return list(filter(lambda x: x, map(lambda x: x.strip(" ").split("=")[0], data.split('\n'))))

def parse_env_dict(env_key_list):
  return {x: os.getenv(x) for x in env_key_list}

def validate_env(env_dict):
  for key in env_dict:
    if not env_dict[key]:
      raise Exception(key + ' is invalid')

def generate_env_file(env_dict, file_name):
  validate_env(env_dict)
  with open(file_name, 'w') as file:
    data = '\r'.join([key + '=' + env_dict[key] for key in env_dict])
    file.write(data)

if __name__ == '__main__':
  env_file, env_keys_file = sys.argv[1:]
  env_keys = parse_env_keys(env_keys_file)
  env_key_value = parse_env_dict(env_keys)
  generate_env_file(env_key_value, env_file)
  print(f"{env_file} file is generated.")
