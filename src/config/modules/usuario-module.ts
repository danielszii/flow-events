import { CreateUsuario } from "../../aplicacao/usecase/usuario/CreateUsuario";
import { ListUsuario } from "../../aplicacao/usecase/usuario/ListUsuario";
import { DeleteUsuario } from "../../aplicacao/usecase/usuario/DeleteUsuario";
import { GetUsuario } from "../../aplicacao/usecase/usuario/GetUsuario";
import { UsuarioRepositorioMysql } from "../../infra/bd/mysql/UsuarioRepositorioMysql";
import { UsuarioRepositorioPg } from "../../infra/bd/pg/UsuarioRepositorioPg";
import { UsuarioControle } from "../../infra/web/express/controle/UsuarioControle";

const usuarioRepositorio = new UsuarioRepositorioMysql();

const usuarioRepositorioPg = new UsuarioRepositorioPg();

const createUsuario = new CreateUsuario(usuarioRepositorioPg);
const listUsuario = new ListUsuario(usuarioRepositorio);
const deleteUsuario = new DeleteUsuario(usuarioRepositorio);
const getUsuario = new GetUsuario(usuarioRepositorio);

export const usuarioControle = new UsuarioControle(
  createUsuario,
  listUsuario,
  deleteUsuario,
  getUsuario,
);