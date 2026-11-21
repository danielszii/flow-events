import { InscricaoInvalidaError } from "../erros/InscricaoInvalidaError";

export enum EstadoInscricao {
  PENDENTE = "PENDENTE",
  CONFIRMADA = "CONFIRMADA",
  EXPIRADA = "EXPIRADA",
  CANCELADA = "CANCELADA",
  ATENDIDA = "ATENDIDA",
}

export type InscricaoProps = {
  id: string;
  usuario_id: string;
  evento_id: string;
  lote_id: string;
  estado: EstadoInscricao;
  reservado_em: string;
  expira_em: string;
  confirmado_em: string | null;
  criado_em: string;
}

const DURACAO_RESERVA_MS = 10 * 60 * 1000;

export class Inscricao {
  private constructor(private props: InscricaoProps) {}

  public static create(
    usuario_id: string,
    evento_id: string,
    lote_id: string,
    reservadoEm: Date = new Date(),
  ): Inscricao {
    if (!usuario_id || !usuario_id.trim()) {
      throw new InscricaoInvalidaError("ID do usuário é obrigatório");
    }
    if (!evento_id || !evento_id.trim()) {
      throw new InscricaoInvalidaError("ID do evento é obrigatório");
    }
    if (!lote_id || !lote_id.trim()) {
      throw new InscricaoInvalidaError("ID do lote é obrigatório");
    }
    if (Number.isNaN(reservadoEm.getTime())) {
      throw new InscricaoInvalidaError("Data da reserva inválida");
    }

    const reservadoEmIso = reservadoEm.toISOString();

    return new Inscricao({
      id: crypto.randomUUID(),
      usuario_id: usuario_id.trim(),
      evento_id: evento_id.trim(),
      lote_id: lote_id.trim(),
      estado: EstadoInscricao.PENDENTE,
      reservado_em: reservadoEmIso,
      expira_em: new Date(reservadoEm.getTime() + DURACAO_RESERVA_MS).toISOString(),
      confirmado_em: null,
      criado_em: reservadoEmIso,
    });
  }

  public static fromPersistence(props: InscricaoProps): Inscricao {
    return new Inscricao({ ...props });
  }

  public toPersistence(): InscricaoProps {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
  }

  public get usuario_id() {
    return this.props.usuario_id;
  }

  public get evento_id() {
    return this.props.evento_id;
  }

  public get lote_id() {
    return this.props.lote_id;
  }

  public get estado() {
    return this.props.estado;
  }

  public get reservado_em() {
    return this.props.reservado_em;
  }

  public get expira_em() {
    return this.props.expira_em;
  }

  public get confirmado_em() {
    return this.props.confirmado_em;
  }

  public get criado_em() {
    return this.props.criado_em;
  }

  public confirmarPagamento(confirmadoEm: Date = new Date()): void {
    this.exigirEstado(EstadoInscricao.PENDENTE);
    this.validarData(confirmadoEm);

    if (confirmadoEm.getTime() < new Date(this.props.reservado_em).getTime()) {
      throw new InscricaoInvalidaError("Confirmação não pode anteceder a reserva");
    }
    if (confirmadoEm.getTime() >= new Date(this.props.expira_em).getTime()) {
      throw new InscricaoInvalidaError("A reserva expirou antes da confirmação");
    }

    this.props.estado = EstadoInscricao.CONFIRMADA;
    this.props.confirmado_em = confirmadoEm.toISOString();
  }

  public expirar(data: Date = new Date()): void {
    this.exigirEstado(EstadoInscricao.PENDENTE);
    this.validarData(data);

    if (data.getTime() < new Date(this.props.expira_em).getTime()) {
      throw new InscricaoInvalidaError("A reserva ainda não expirou");
    }

    this.props.estado = EstadoInscricao.EXPIRADA;
  }

  public cancelar(): void {
    if (
      this.props.estado !== EstadoInscricao.PENDENTE
      && this.props.estado !== EstadoInscricao.CONFIRMADA
    ) {
      throw new InscricaoInvalidaError("Esta inscrição não pode ser cancelada");
    }

    this.props.estado = EstadoInscricao.CANCELADA;
  }

  public registrarPresenca(): void {
    this.exigirEstado(EstadoInscricao.CONFIRMADA);
    this.props.estado = EstadoInscricao.ATENDIDA;
  }

  public ocupaVagaEm(data: Date = new Date()): boolean {
    this.validarData(data);

    return this.props.estado === EstadoInscricao.CONFIRMADA
      || this.props.estado === EstadoInscricao.ATENDIDA
      || (
        this.props.estado === EstadoInscricao.PENDENTE
        && data.getTime() < new Date(this.props.expira_em).getTime()
      );
  }

  private exigirEstado(estadoEsperado: EstadoInscricao): void {
    if (this.props.estado !== estadoEsperado) {
      throw new InscricaoInvalidaError(
        `A operação exige uma inscrição no estado ${estadoEsperado}`,
      );
    }
  }

  private validarData(data: Date): void {
    if (Number.isNaN(data.getTime())) {
      throw new InscricaoInvalidaError("Data inválida");
    }
  }
}
