import logger from "../utils/logger.js";

// Classe para erros personalizados
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Middleware de erro global
export const errorHandler = (err, req, res, next) => {
  logger.error(`Erro: ${err.message} - Status: ${err.statusCode || 500}`);

  res.status(err.statusCode || 500).json({
    error: err.message || "Erro interno do servidor",
  });
};
