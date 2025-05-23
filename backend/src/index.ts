import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- MODELO ---
class User {
  constructor(public email: string, public password: string) {}
}

// --- SERVICIO ---
class AuthService {
  private users: User[] = [];

  register(email: string, password: string): boolean {
    if (this.users.find(u => u.email === email)) return false;
    this.users.push(new User(email, password));
    return true;
  }

  login(email: string, password: string): boolean {
    return !!this.users.find(u => u.email === email && u.password === password);
  }
}

// --- CONTROLADOR ---
class AuthController {
  constructor(private service: AuthService) {}

  register = (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan datos' });
    const ok = this.service.register(email, password);
    if (ok) return res.status(201).json({ message: 'Usuario registrado' });
    return res.status(409).json({ message: 'El usuario ya existe' });
  };

  login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan datos' });
    const ok = this.service.login(email, password);
    if (ok) return res.status(200).json({ message: 'Login exitoso' });
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  };
}

const authService = new AuthService();
const authController = new AuthController(authService);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API de Tienda de Ropa' });
});

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
