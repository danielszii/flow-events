import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { Inscricao } from "../../../dominio/entidades/Inscricao";
import { FilaEsperaRepositorio } from "../../../dominio/repositorios/FilaEsperaRepositorio";
import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";

export type PromoverFilaEsperaInputDTO = {
  lote_id: string;
}

export interface PromotorFilaEspera {
  execute(input: PromoverFilaEsperaInputDTO): Promise<Inscricao | null>;
}

export class PromoverFilaEspera implements PromotorFilaEspera {
  constructor(
    private readonly inscricaoRepositorio: InscricaoRepositorio,
    private readonly filaEsperaRepositorio: FilaEsperaRepositorio,
    private readonly loteRepositorio: LoteRepositorio,
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly eventoRepositorio: EventoRepositorio,
    private readonly obterAgora: () => Date = () => new Date(),
  ) {}

  public async execute(input: PromoverFilaEsperaInputDTO): Promise<Inscricao | null> {
    if (typeof input.lote_id !== "string" || !input.lote_id.trim()) {
      throw new Error("ID do lote é obrigatório");
    }

    const agora = this.obterAgora();
    if (Number.isNaN(agora.getTime())) {
      throw new Error("Relógio retornou uma data inválida");
    }

    const loteId = input.lote_id.trim();
    const entradas = await this.filaEsperaRepositorio.listarPorLoteEmOrdemDeEntrada(loteId);
    if (entradas.length === 0) {
      return null;
    }

    const lote = await this.loteRepositorio.buscarPorId(loteId);
    if (!lote) {
      throw new Error(`Lote com ID ${loteId} não encontrado ao promover fila`);
    }

    const inscricoesDoLote = await this.inscricaoRepositorio.listarPorLote(lote.id);
    const vagasOcupadas = inscricoesDoLote.filter((inscricao) => inscricao.ocupaVagaEm(agora)).length;
    if (vagasOcupadas >= lote.quantidade_total) {
      return null;
    }

    const evento = await this.eventoRepositorio.buscarPorId(lote.evento_id);
    if (!evento) {
      throw new Error(`Evento com ID ${lote.evento_id} não encontrado ao promover fila`);
    }

    for (const entrada of entradas) {
      if (entrada.evento_id !== evento.id) {
        throw new Error(`Entrada ${entrada.id} da fila não corresponde ao evento do lote`);
      }

      const usuario = await this.usuarioRepositorio.buscarPorId(entrada.usuario_id);
      if (!usuario) {
        throw new Error(`Usuário com ID ${entrada.usuario_id} não encontrado ao promover fila`);
      }

      const inscricoesDoCpf = await this.inscricaoRepositorio.listarPorCpfEEvento(
        usuario.cpf,
        evento.id,
      );
      const ingressosAtivosDoCpf = inscricoesDoCpf
        .filter((inscricao) => inscricao.ocupaVagaEm(agora)).length;
      if (ingressosAtivosDoCpf >= evento.limite_ingressos_cpf) {
        continue;
      }

      const inscricaoPromovida = Inscricao.create(usuario.id, evento.id, lote.id, agora);
      await this.inscricaoRepositorio.salvar(inscricaoPromovida);
      await this.filaEsperaRepositorio.remover(entrada.id);
      return inscricaoPromovida;
    }

    return null;
  }
}
