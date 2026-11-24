import { CreateUsuario } from "../../aplicacao/usecase/usuario/CreateUsuario";
import { ListUsuario } from "../../aplicacao/usecase/usuario/ListUsuario";
import { DeleteUsuario } from "../../aplicacao/usecase/usuario/DeleteUsuario";
import { GetUsuario } from "../../aplicacao/usecase/usuario/GetUsuario";
import { UsuarioRepositorioPostgres } from "../../infra/bd/postgres/UsuarioRepositorioPostgres";
import { UsuarioControle } from "../../infra/web/express/controle/UsuarioControle";

const usuarioRepositorio = new UsuarioRepositorioPostgres();

const createUsuario = new CreateUsuario(usuarioRepositorio);
const listUsuario = new ListUsuario(usuarioRepositorio);
const deleteUsuario = new DeleteUsuario(usuarioRepositorio);
const getUsuario = new GetUsuario(usuarioRepositorio);

export const usuarioControle = new UsuarioControle(
  createUsuario,
  listUsuario,
  deleteUsuario,
  getUsuario,
);
