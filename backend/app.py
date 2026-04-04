"""
Cali Connect Backend - Flask Application
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'mysql'),
    'user': os.getenv('DB_USER', 'caliconnect'),
    'password': os.getenv('DB_PASSWORD', 'caliconnect_pass'),
    'database': os.getenv('DB_NAME', 'caliconnect'),
    'charset': 'utf8mb4',
    # Add port with default MySQL port
    'port': int(os.getenv('DB_PORT', '3306'))
}

def get_db_connection():
    """Create a database connection"""
    # Ensure proper types for connection parameters
    config = DB_CONFIG.copy()
    # Convert port to int if present
    if 'port' in config and isinstance(config['port'], str):
        config['port'] = int(config['port'])
    # Ensure charset is string
    if 'charset' in config and not isinstance(config['charset'], str):
        config['charset'] = str(config['charset'])
    return pymysql.connect(**config)

def init_database():
    """Initialize database and create tables"""
    connection = pymysql.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        charset='utf8mb4'
    )
    
    try:
        with connection.cursor() as cursor:
            # Create database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
            cursor.execute(f"USE {DB_CONFIG['database']}")
            
            # Products table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10, 2) NOT NULL,
                    icon VARCHAR(50),
                    category VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Orders table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    paypal_order_id VARCHAR(100),
                    amount DECIMAL(10, 2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    items TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Network quotes table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS network_quotes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    phone VARCHAR(20),
                    service_type VARCHAR(50),
                    message TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Messages table (for chat/messaging)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    session_id VARCHAR(100),
                    user_message TEXT NOT NULL,
                    bot_response TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Insert default products if not exist
            cursor.execute("SELECT COUNT(*) FROM products")
            if cursor.fetchone()[0] == 0:
                default_products = [
                    ('Servicio de Página Web Basic', 'Página web básica con 5 secciones', 150.00, 'fa-globe', 'web'),
                    ('Servicio de Página Web Pro', 'Página web profesional con CMS', 350.00, 'fa-laptop-code', 'web'),
                    ('Tienda Online Basic', 'E-commerce con 50 productos', 400.00, 'fa-shopping-bag', 'web'),
                    ('Configuración Router', 'Configuración completa de router empresarial', 80.00, 'fa-router', 'network'),
                    ('Configuración Switch', 'Switch gestionable con VLANs', 120.00, 'fa-network-wired', 'network'),
                    ('Paquete Redes Corporativas', 'Router + Switch + Instalación', 250.00, 'fa-server', 'network'),
                    ('Sistema de Mensajería', 'Chat en vivo para tu sitio web', 100.00, 'fa-comments', 'messaging'),
                    ('Mantenimiento Mensual', 'Soporte técnico y actualizaciones', 50.00, 'fa-tools', 'support')
                ]
                
                cursor.executemany(
                    "INSERT INTO products (name, description, price, icon, category) VALUES (%s, %s, %s, %s, %s)",
                    default_products
                )
            
            connection.commit()
            print("Database initialized successfully!")
            
    except Exception as e:
        print(f"Database initialization error: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

# ==================== Products API ====================
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    try:
        connection = get_db_connection()
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM products ORDER BY id")
            products = cursor.fetchall()
            
            # Convert Decimal to float for JSON serialization
            for product in products:
                if product.get('price'):
                    product['price'] = float(product['price'])
            
            return jsonify(products)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify([])
    finally:
         if 'connection' in locals():
             connection.close()

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product"""
    try:
        connection = get_db_connection()
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
            product = cursor.fetchone()
            
            if product and product.get('price'):
                product['price'] = float(product['price'])
            
            return jsonify(product or {})
    except Exception as e:
        print(f"Error fetching product: {e}")
        return jsonify({})
    finally:
        if 'connection' in locals():
            connection.close()

# ==================== Orders API ====================
@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        with connection.cursor() as cursor:
            import json
            cursor.execute(
                """INSERT INTO orders (paypal_order_id, amount, status, items) 
                   VALUES (%s, %s, %s, %s)""",
                (data.get('paypal_order_id'), data.get('amount'), 
                 data.get('status', 'pending'), json.dumps(data.get('items', [])))
            )
            connection.commit()
            order_id = cursor.lastrowid
            
        return jsonify({'success': True, 'order_id': order_id})
    except Exception as e:
        print(f"Error creating order: {e}")
        return jsonify({'success': False, 'error': str(e)})
    finally:
         if 'connection' in locals():
             connection.close()

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders"""
    try:
        connection = get_db_connection()
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
            orders = cursor.fetchall()
            
            for order in orders:
                if order.get('amount'):
                    order['amount'] = float(order['amount'])
            
            return jsonify(orders)
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return jsonify([])
    finally:
        if 'connection' in locals():
            connection.close()

# ==================== Network Quotes API ====================
@app.route('/api/network-quotes', methods=['POST'])
def create_network_quote():
    """Create a new network quote request"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO network_quotes (name, email, phone, service_type, message) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (data.get('name'), data.get('email'), data.get('phone'),
                 data.get('service_type'), data.get('message'))
            )
            connection.commit()
            quote_id = cursor.lastrowid
            
        return jsonify({'success': True, 'quote_id': quote_id})
    except Exception as e:
        print(f"Error creating network quote: {e}")
        return jsonify({'success': False, 'error': str(e)})
    finally:    
        if 'connection' in locals():
            connection.close()

@app.route('/api/network-quotes', methods=['GET'])
def get_network_quotes():
    """Get all network quote requests"""
    try:
        connection = get_db_connection()
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM network_quotes ORDER BY created_at DESC")
            quotes = cursor.fetchall()
            
        return jsonify(quotes)
    except Exception as e:
        print(f"Error fetching network quotes: {e}")
        return jsonify([])
    finally:     
        if 'connection' in locals():
            connection.close()

# ==================== Messaging API ====================
@app.route('/api/chat', methods=['POST'])
def send_message():
    """Send a message and get bot response"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        # Get bot response
        bot_response = get_bot_response(user_message)
        
        # Save message to database
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO messages (session_id, user_message, bot_response) 
                   VALUES (%s, %s, %s)""",
                (session_id, user_message, bot_response)
            )
            connection.commit()
            
        return jsonify({'response': bot_response})
    except Exception as e:
        print(f"Error sending message: {e}")
        return jsonify({'response': 'Lo siento, hubo un error. Intenta de nuevo.'})
    finally:        
        if 'connection' in locals():
            connection.close()

def get_bot_response(message):
    """Generate bot response based on message"""
    lower_message = message.lower()
    
    if any(word in lower_message for word in ['hola', 'hello', 'buenos', 'buenas']):
        return '¡Hola! Bienvenido a Cali Connect. ¿En qué puedo ayudarte hoy?'
    elif any(word in lower_message for word in ['precio', 'costo', 'cuánto', 'cuanto']):
        return 'Tenemos diversos servicios. Puedes ver nuestra tienda en la sección correspondiente. ¿Te gustaría información sobre algún servicio específico?'
    elif any(word in lower_message for word in ['web', 'página', 'sitio', 'pagina']):
        return 'Ofrecemos servicios de desarrollo web desde $150 USD. Podemos crear tu página web profesional. ¿Te interesa?'
    elif any(word in lower_message for word in ['red', 'router', 'switch', 'redes']):
        return 'Contamos con servicios de configuración de redes, routers y switches. Visita la sección de Redes para más información.'
    elif any(word in lower_message for word in ['pago', 'paypal', 'pagar']):
        return 'Aceptamos pagos a través de PayPal de forma segura. ¿Necesitas ayuda con el proceso de pago?'
    elif any(word in lower_message for word in ['contacto', 'hablar', 'habla']):
        return 'Puedes contactarnos a través de info@caliconnect.com o llamado al +57 300 123 4567'
    elif any(word in lower_message for word in ['gracias', 'thank']):
        return '¡De nada! Estamos para servirte. ¿Hay algo más en lo que pueda ayudarte?'
    else:
        return 'Gracias por tu mensaje. Un asesor te responderá pronto. ¿Hay algo más en lo que pueda ayudarte?'

# ==================== Health Check ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Cali Connect API'})

# ==================== Main ====================
if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
