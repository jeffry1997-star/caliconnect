-- =====================================================
-- SCRIPT PARA AGREGAR PRODUCTOS A LA BASE DE DATOS
-- Cali Connect
-- =====================================================

-- Ver productos actuales
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    icon VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- OPCIÓN 1: Agregar productos manualmente con INSERT
-- =====================================================

-- Ejemplo: Agregar un router
INSERT INTO products (name, description, price, icon, category) 
VALUES ('Nombre del Producto', 'Descripción del producto', 99.99, 'fa-router', 'network');

-- =====================================================
-- PRODUCTOS DE TECNOLOGÍA SUGERIDOS
-- =====================================================

-- Routers
INSERT INTO products (name, description, price, icon, category) VALUES 
('Router WiFi 6 TP-Link Archer AX73', 'Router Gigabit Dual Band AX5400', 129.99, 'fa-wifi', 'network'),
('Router Mesh WiFi 6E Deco XE75', 'Sistema WiFi Mesh Tri-Band 5400Mbps', 299.99, 'fa-wifi', 'network'),
('Router ASUS RT-AX88U', 'Router WiFi 6 Gaming 6000Mbps', 249.99, 'fa-gamepad', 'network');

-- Switches
INSERT INTO products (name, description, price, icon, category) VALUES 
('Switch TP-Link TL-SG1008D', 'Switch 8 Puertos Gigabit Plug & Play', 29.99, 'fa-network-wired', 'network'),
('Switch Cisco SG350-28', 'Switch Gestionable 28 Puertos Gigabit', 350.00, 'fa-server', 'network'),
('Switch Netgear GS108Tv3', 'Switch 8 Puertos Gigabit Gestión VLAN', 45.00, 'fa-network-wired', 'network');

-- Mouse
INSERT INTO products (name, description, price, icon, category) VALUES 
('Mouse Inalámbrico Logitech MX Master 3', 'Mouse ergonómico con wheel velocidad', 99.99, 'fa-computer-mouse', 'peripherals'),
('Mouse Gamer Razer DeathAdder V3', 'Mouse gamer 64g Pro Focus 30K', 69.99, 'fa-gamepad', 'peripherals'),
('Mouse Vertical Ergonomic Delux', 'Mouse vertical inalámbrico 800-2400DPI', 35.00, 'fa-hand', 'peripherals');

-- Teclados
INSERT INTO products (name, description, price, icon, category) VALUES 
('Teclado Mecánico Logitech G915', 'Teclado wireless RGB GL Tactile', 199.99, 'fa-keyboard', 'peripherals'),
('Teclado Gamer Corsair K70 RGB Pro', 'Mecánico Cherry MX Speed', 159.99, 'fa-gamepad', 'peripherals'),
('Teclado Inalámbrico Apple Magic', 'Keyboard español con Touch ID', 199.00, 'fa-apple', 'peripherals');

-- Monitores
INSERT INTO products (name, description, price, icon, category) VALUES 
('Monitor Samsung 32" Odyssey G7', 'Monitor curvo 240Hz 1ms', 599.99, 'fa-desktop', 'peripherals'),
('Monitor LG 27" UltraGear', 'Monitor 27" IPS 144Hz', 349.00, 'fa-display', 'peripherals'),
('Monitor ASUS ProArt PA278QV', 'Monitor 27" IPS 100% sRGB', 289.00, 'fa-palette', 'peripherals');

-- Webcams
INSERT INTO products (name, description, price, icon, category) VALUES 
('Webcam Logitech Brio 4K', 'Ultra HD 4K con HDR', 199.99, 'fa-video', 'peripherals'),
('Webcam Razer Kiyo Pro', 'Webcam 1080p 60fps Adaptive Light Sensor', 159.99, 'fa-video', 'peripherals');

-- Auriculares
INSERT INTO products (name, description, price, icon, category) VALUES 
('Auriculares Sony WH-1000XM5', 'Noise Cancelling Industry Leading', 349.99, 'fa-headphones', 'peripherals'),
('Auriculares AirPods Pro 2', 'Apple AirPods Pro con USB-C', 249.00, 'fa-headphones', 'peripherals'),
('Auriculares Gamer HyperX Cloud III', 'Audífonos 7.1 Surround', 99.99, 'fa-headset', 'peripherals');

-- Almacenamiento
INSERT INTO products (name, description, price, icon, category) VALUES 
('Disco SSD Samsung 980 PRO 1TB', 'NVMe PCIe 4.0 7000MB/s', 109.99, 'fa-hdd', 'storage'),
('Disco Externo WD Black 2TB', 'SSD Portátil 1050MB/s', 179.00, 'fa-drive', 'storage'),
('USB SanDisk 128GB', 'Pendrive 3.1 130MB/s', 15.99, 'fa-usb', 'storage');

-- Componentes
INSERT INTO products (name, description, price, icon, category) VALUES 
('Memoria RAM Corsair Vengeance 32GB', 'DDR4 3200MHz Dual Channel', 89.99, 'fa-memory', 'components'),
('Fuente de Poder EVGA 850W', 'Modular 80+ Gold SuperNOVA', 129.99, 'fa-plug', 'components'),
('Tarjeta Gráfica RTX 4060', 'NVIDIA GeForce RTX 4060 8GB', 399.00, 'fa-microchip', 'components');

-- =====================================================
