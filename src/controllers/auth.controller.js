import { registerUser, loginUser, changePassword } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const token = await registerUser(req.body.name, req.body.email, req.body.password);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const token = await loginUser(req.body.email, req.body.password);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Função para alteração de senha
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; 

    await changePassword(userId, oldPassword, newPassword);
    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
