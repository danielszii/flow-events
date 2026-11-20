import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { DeleteUsuarioInputDTO, DeleteUsuarioOutputDTO } from "../../dto/usuario/DeleteUsuarioDTO";
import { UseCase } from "../UseCase";

export class DeleteUsuario implements UseCase<DeleteUsuarioInputDTO, DeleteUsuarioOutputDTO> {
  constructor(private readonly usuarioRepositorio: UsuarioRepositorio) { }

  public async execute(inputDto: DeleteUsuarioInputDTO): Promise<DeleteUsuarioOutputDTO> {

    try {
      await this.usuarioRepositorio.deletar(inputDto.id);

      const outputDTO: DeleteUsuarioOutputDTO = {
        success: true,
        message: `Usuário com ID ${inputDto.id} deletado com sucesso`,
      };

      return outputDTO;
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}