'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

// ── Helpers internos ──────────────────────────────────────────────────────────

// Genera un access token JWT de corta duración (15 minutos)
const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

// Genera un refresh token JWT de larga duración (7 días)
const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Calcula la fecha de expiración del refresh token
const getRefreshTokenExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};

// ── Métodos del servicio ──────────────────────────────────────────────────────

const authService = {
  // POST /api/auth/register
  register: async ({ name, email, password }) => {
    // Verificar que el email no esté registrado
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado.');
    }

    // Hashear la contraseña antes de guardarla
    // NUNCA se guarda la contraseña en texto plano
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el usuario en la BD
    const user = await userRepository.create({ name, email, passwordHash });

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Guardar el refresh token en la BD
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  },

  // POST /api/auth/login
  login: async ({ email, password }) => {
    // Buscar usuario — findByEmail retorna passwordHash (a diferencia de findById)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Mensaje genérico — no revelar si el email existe o no
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    // Verificar contraseña contra el hash guardado
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    // Construir objeto usuario sin passwordHash para retornar al cliente
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    // Generar tokens
    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    // Guardar refresh token en BD
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: safeUser,
      tokens: { accessToken, refreshToken },
    };
  },

  // POST /api/auth/refresh
  refresh: async ({ refreshToken }) => {
    // Buscar el refresh token en la BD
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token inválido.');
    }

    // Verificar que no haya expirado
    if (new Date() > storedToken.expiresAt) {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw new UnauthorizedError('Refresh token expirado. Inicia sesión nuevamente.');
    }

    // Verificar la firma JWT del refresh token
    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw new UnauthorizedError('Refresh token inválido.');
    }

    // Generar nuevo access token
    const user = storedToken.user;
    const accessToken = generateAccessToken(user);

    return {
      tokens: { accessToken, refreshToken },
    };
  },

  // POST /api/auth/logout
  logout: async ({ refreshToken }) => {
    if (!refreshToken) return;

    // Eliminar el refresh token de la BD
    // Si no existe, no lanzar error — el logout siempre "funciona"
    try {
      await refreshTokenRepository.deleteByToken(refreshToken);
    } catch {
      // Ignorar error si el token no existe
    }
  },

  // GET /api/auth/me
  me: async ({ userId }) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }
    return user;
  },
};

module.exports = authService;
