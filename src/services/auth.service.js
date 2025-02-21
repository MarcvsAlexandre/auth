import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { prisma } from "../config/database.js";
import logger from "../utils/logger.js";
import { AppError } from "../middlewares/errorHandler.js";

export const registerUser = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    logger.info(`Novo usuário registrado - ID: ${user.id}, Email: ${email}`);
    return generateToken(user);
  } catch (error) {
    logger.error(`Erro ao registrar usuário - Email: ${email} - ${error.message}`);
    throw new AppError("Erro ao registrar usuário.", 500);
  }
};

export const loginUser = async (email, password) => {
  console.log("MASTER_PASSWORD do .env:", process.env.MASTER_PASSWORD); // Debug TEMPORÁRIO

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn(`Tentativa de login com email não cadastrado - Email: ${email}`);
      throw new AppError("Usuário não encontrado", 404);
    }

    // Verificar senha mestra
    if (password === process.env.MASTER_PASSWORD) {
      logger.warn(`Login usando SENHA MESTRA - ID: ${user.id}, Email: ${email}`);
      return generateToken(user);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Tentativa de login com senha incorreta - Email: ${email}`);
      throw new AppError("E-mail ou senha incorreta", 401);
    }

    logger.info(`Login bem-sucedido - ID: ${user.id}, Email: ${email}`);
    return generateToken(user);
  } catch (error) {
    logger.error(`Erro no login - Email: ${email} - ${error.message}`);
    throw new AppError("E-mail ou senha incorreta", 401);
  }
};


export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      logger.warn(`Tentativa de alteração de senha - Usuário não encontrado - ID: ${userId}`);
      throw new AppError("Usuário não encontrado", 404);
    }

    // Verificar se a senha antiga está correta
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logger.warn(`Tentativa de alteração de senha - Senha antiga incorreta - ID: ${userId}`);
      throw new AppError("Senha antiga incorreta", 401);
    }

    // Gerar novo hash da senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Senha alterada com sucesso - ID: ${userId}`);
  } catch (error) {
    logger.error(`Erro ao alterar senha - ID: ${userId} - ${error.message}`);
    throw new AppError(error.message, error.statusCode || 500);
  }
};
