from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Contraseña que quieres hashear
contrasena = "admin123"

# Generar el hash
hash_generado = pwd_context.hash(contrasena)

print("="*50)
print(f"Contraseña original: {contrasena}")
print(f"Hash generado: {hash_generado}")
print("="*50)
print("\nCopia este hash y actualiza la base de datos con:")
print(f"UPDATE Usuario SET contrasena_hash = '{hash_generado}' WHERE usuario = 'PITI';")




# para ejecutar este script:# python backend/generar_hash.py