import { EstadoEvento } from "../../../dominio/entidades/Evento";
import { Inscricao } from "../../../dominio/entidades/Inscricao";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { PromotorFilaEspera } from "./PromoverFilaEspera";
import { FilaEspera } from "../../../dominio/entidades/FilaEspera";
import { FilaEsperaRepositorio } from "../../../dominio/repositorios/FilaEsperaRepositorio";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { ReservaInscricaoError } from "../../erros/ReservaInscricaoError";
import {
  ReservarInscricaoInputDTO,
  ReservarInscricaoOutputDTO,
} from "../../dto/inscricao/ReservarInscricaoDTO";
import { UseCase } from "../UseCase";

export class ReservarInscricao implements UseCase<ReservarInscricaoInputDTO, ReservarInscricaoOutputDTO> {
  constructor(
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly eventoRepositorio: EventoRepositorio,
    private readonly loteRepositorio: LoteRepositorio,
    private readonly inscricaoRepositorio: InscricaoRepositorio,
    private readonly filaEsperaRepositorio: FilaEsperaRepositorio,
    private readonly promotorFilaEspera: PromotorFilaEspera,
    private readonly obterAgora: () => Date = () => new Date(),
  ) { }

  public async execute(input: ReservarInscricaoInputDTO): Promise<ReservarInscricaoOutputDTO> {
    this.validarId(input.usuario_id, "ID do usuário");
    this.validarId(input.evento_id, "ID do evento");
    this.validarId(input.lote_id, "ID do lote");

    const usuarioId = input.usuario_id.trim();
    const eventoId = input.evento_id.trim();
    const loteId = input.lote_id.trim();

    const usuario = await this.usuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ReservaInscricaoError(
        "USUARIO_NAO_ENCONTRADO",
        `Usuário com ID ${usuarioId} não encontrado`,
      );
    }

    const evento = await this.eventoRepositorio.buscarPorId(eventoId);
    if (!evento) {
      throw new ReservaInscricaoError(
        "EVENTO_NAO_ENCONTRADO",
        `Evento com ID ${eventoId} não encontrado`,
      );
    }
    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new ReservaInscricaoError(
        "EVENTO_NAO_PUBLICADO",
        "O evento precisa estar publicado para receber inscrições",
      );
    }

    const lote = await this.loteRepositorio.buscarPorId(loteId);
    if (!lote) {
      throw new ReservaInscricaoError(
        "LOTE_NAO_ENCONTRADO",
        `Lote com ID ${loteId} não encontrado`,
      );
    }
    if (lote.evento_id !== evento.id) {
      throw new ReservaInscricaoError(
        "LOTE_NAO_PERTENCE_AO_EVENTO",
        "O lote não pertence ao evento informado",
      );
    }

    const agora = this.obterAgora();
    if (Number.isNaN(agora.getTime())) {
      throw new Error("Relógio retornou uma data inválida");
    }
    if (!lote.vendasAbertasEm(agora)) {
      throw new ReservaInscricaoError(
        "VENDAS_FECHADAS",
        "O lote não está em período de vendas",
      );
    }

    const [inscricoesDoLote, inscricoesDoCpf] = await Promise.all([
      this.inscricaoRepositorio.listarPorLote(lote.id),
      this.inscricaoRepositorio.listarPorCpfEEvento(usuario.cpf, evento.id),
    ]);

    let vagasOcupadas = inscricoesDoLote.filter((inscricao) => inscricao.ocupaVagaEm(agora)).length;
    const inscricoesAtivasDoCpf = inscricoesDoCpf.filter((inscricao) => inscricao.ocupaVagaEm(agora)).length;
    if (inscricoesAtivasDoCpf >= evento.limite_ingressos_cpf) {
      throw new ReservaInscricaoError(
        "LIMITE_CPF_EXCEDIDO",
        "O limite de ingressos por CPF para este evento foi atingido",
      );
    }

    while (vagasOcupadas < lote.quantidade_total) {
      const entradasNaFila = await this.filaEsperaRepositorio.listarPorLoteEmOrdemDeEntrada(lote.id);
      if (entradasNaFila.length === 0) {
        break;
      }

      const promovida = await this.promotorFilaEspera.execute({ lote_id: lote.id });
      if (!promovida) {
        break;
      }

      vagasOcupadas += 1;
      if (promovida.usuario_id === usuario.id) {
        return {
          tipo: "RESERVA",
          id: promovida.id,
          estado: promovida.estado,
          expira_em: promovida.expira_em,
        };
      }
    }

    if (vagasOcupadas >= lote.quantidade_total) {
      const entradaExistente = await this.filaEsperaRepositorio.buscarPorUsuarioELote(
        usuario.id,
        lote.id,
      );
      if (entradaExistente) {
        throw new ReservaInscricaoError(
          "JA_NA_FILA",
          "Usuário já está na fila de espera deste lote",
        );
      }

      const entrada = FilaEspera.create(usuario.id, evento.id, lote.id, agora);
      await this.filaEsperaRepositorio.salvar(entrada);

      return {
        tipo: "FILA_ESPERA",
        id: entrada.id,
        estado: "AGUARDANDO",
        criado_em: entrada.criado_em,
      };
    }

    const entradaExistente = await this.filaEsperaRepositorio.buscarPorUsuarioELote(
      usuario.id,
      lote.id,
    );
    if (entradaExistente) {
      throw new ReservaInscricaoError(
        "JA_NA_FILA",
        "Usuário já está na fila de espera deste lote",
      );
    }

    const inscricao = Inscricao.create(usuario.id, evento.id, lote.id, agora);
    await this.inscricaoRepositorio.salvar(inscricao);

    return {
      tipo: "RESERVA",
      id: inscricao.id,
      estado: inscricao.estado,
      expira_em: inscricao.expira_em,
    };
  }

  private validarId(id: string, campo: string): void {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error(`${campo} é obrigatório`);
    }
  }
}
