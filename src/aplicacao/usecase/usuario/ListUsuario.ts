import { Usuario } from "../../../dominio/entidades/Usuario";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { ListUsuarioInputDTO, ListUsuarioOutputDTO } from "../../dto/usuario/ListUsuarioDTO";
import { UseCase } from "../UseCase";

export class ListUsuario implements UseCase<ListUsuarioInputDTO, ListUsuarioOutputDTO> {
  constructor(private readonly usuarioRepositorio: UsuarioRepositorio) { }

  public async execute(inputDto: ListUsuarioInputDTO): Promise<ListUsuarioOutputDTO> {

    const usuarios = await this.usuarioRepositorio.listar();

    const outputDTO: ListUsuarioOutputDTO = this.presentOutput(usuarios);

    return outputDTO;
  }

  private presentOutput(usuarios: Usuario[]): ListUsuarioOutputDTO {
    return {
      usuarios: usuarios.map((usuario) => {
        return {
          id: usuario.id,
          cpf: usuario.cpf,
          nome: usuario.nome,
          email: usuario.email,
        };
      }),
    };
  }
}