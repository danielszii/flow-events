import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { GetUsuarioInputDTO, GetUsuarioOutputDTO } from "../../dto/usuario/GetUsuarioDTO";
import { UseCase } from "../UseCase";

export class GetUsuario implements UseCase<GetUsuarioInputDTO, GetUsuarioOutputDTO> {
  constructor(private readonly usuarioRepositorio: UsuarioRepositorio) { }

  public async execute(inputDto: GetUsuarioInputDTO): Promise<GetUsuarioOutputDTO> {

    const usuario = await this.usuarioRepositorio.buscarPorId(inputDto.id);

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      cpf: usuario.cpf,
      nome: usuario.nome,
      email: usuario.email,
      criado_em: usuario.criado_em,
    };
  }
}