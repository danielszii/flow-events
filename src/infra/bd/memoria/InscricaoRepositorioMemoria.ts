import { Inscricao } from "../../../dominio/entidades/Inscricao";
import { EstadoInscricao } from "../../../dominio/entidades/Inscricao";
import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";

export class InscricaoRepositorioMemoria implements InscricaoRepositorio {
  private readonly inscricoes = new Map<string, Inscricao>();

  constructor(private readonly usuarioRepositorio: UsuarioRepositorio) {}

  public async buscarPorId(id: string): Promise<Inscricao | null> {
    return this.inscricoes.get(id) ?? null;
  }

  public async listarPorUsuario(usuario_id: string): Promise<Inscricao[]> {
    return [...this.inscricoes.values()]
      .filter((inscricao) => inscricao.usuario_id === usuario_id);
  }

  public async listarPorCpfEEvento(cpf: string, evento_id: string): Promise<Inscricao[]> {
    const usuarios = await this.usuarioRepositorio.listar();
    const usuarioIds = new Set(
      usuarios.filter((usuario) => usuario.cpf === cpf).map((usuario) => usuario.id),
    );

    return [...this.inscricoes.values()].filter((inscricao) => (
      inscricao.evento_id === evento_id && usuarioIds.has(inscricao.usuario_id)
    ));
  }

  public async listarPorLote(lote_id: string): Promise<Inscricao[]> {
    return [...this.inscricoes.values()]
      .filter((inscricao) => inscricao.lote_id === lote_id);
  }

  public async listarPendentesExpiradas(ate: Date): Promise<Inscricao[]> {
    if (Number.isNaN(ate.getTime())) {
      throw new Error("Data limite para expiração inválida");
    }

    return [...this.inscricoes.values()].filter((inscricao) => (
      inscricao.estado === EstadoInscricao.PENDENTE
      && new Date(inscricao.expira_em).getTime() <= ate.getTime()
    ));
  }

  public async salvar(inscricao: Inscricao): Promise<void> {
    if (this.inscricoes.has(inscricao.id)) {
      throw new Error(`Inscrição com ID ${inscricao.id} já existe`);
    }

    this.inscricoes.set(inscricao.id, inscricao);
  }

  public async atualizar(inscricao: Inscricao): Promise<void> {
    if (!this.inscricoes.has(inscricao.id)) {
      throw new Error(`Inscrição com ID ${inscricao.id} não encontrada`);
    }

    this.inscricoes.set(inscricao.id, inscricao);
  }
}
