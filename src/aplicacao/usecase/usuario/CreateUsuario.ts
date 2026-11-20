import { Usuario } from "../../../dominio/entidades/Usuario";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { CreateUsuarioInputDTO } from "../../dto/usuario/CreateUsuarioInputDTO";
import { CreateUsuarioOutputDTO } from "../../dto/usuario/CreateUsuarioOutputDTO";
import { UseCase } from "../UseCase";

export class CreateUsuario implements UseCase<CreateUsuarioInputDTO, CreateUsuarioOutputDTO> {
  constructor(private readonly usuarioRepositorio: UsuarioRepositorio) { }

  public async execute(inputDto: CreateUsuarioInputDTO): Promise<CreateUsuarioOutputDTO> {

    const usuario = Usuario.create(
      inputDto.cpf,
      inputDto.nome,
      inputDto.email,
    );
    await this.usuarioRepositorio.salvar(usuario);

    const outputDTO: CreateUsuarioOutputDTO = { id: usuario.id };

    return outputDTO;
  }
}