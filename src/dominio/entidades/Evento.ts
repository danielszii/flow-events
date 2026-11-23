import { EventoEstadoInvalidoError } from "../erros/EventoEstadoInvalidoError";

export enum EstadoEvento {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
  CANCELADO = 'CANCELADO',
}

export type EventoProps = {
  id: string;
  titulo: string;
  descricao: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  limite_ingressos_cpf: number;
  estado: EstadoEvento;
  criado_em: string;
}

export class Evento {

  private constructor(
    private props: EventoProps
  ) {
  }

  public static create(
    titulo: string,
    descricao: string,
    data_hora_inicio: string,
    data_hora_fim: string,
    limite_ingressos_cpf: number,
  ): Evento {

    if (!titulo || !titulo.trim()) {
      throw new Error('Título é obrigatório');
    }
    if (!data_hora_inicio || !data_hora_fim) {
      throw new Error('Data de início e fim são obrigatórias');
    }

    return new Evento({
      id: crypto.randomUUID().toString(),
      titulo,
      descricao,
      data_hora_inicio,
      data_hora_fim,
      limite_ingressos_cpf,
      estado: EstadoEvento.RASCUNHO,
      criado_em: new Date().toISOString(),
    });
  }

  public publicar(): void {
    if (this.props.estado !== EstadoEvento.RASCUNHO) {
      throw new EventoEstadoInvalidoError('Apenas eventos em rascunho podem ser publicados');
    }
    this.props.estado = EstadoEvento.PUBLICADO;
  }

  public cancelar(): void {
    if (this.props.estado === EstadoEvento.CANCELADO) {
      throw new Error('Evento já está cancelado');
    }
    this.props.estado = EstadoEvento.CANCELADO;
  }

  public static fromPersistence(props: EventoProps): Evento {
    return new Evento(props);
  }

  public toPersistence(): EventoProps {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
  }

  public get titulo() {
    return this.props.titulo;
  }

  public get descricao() {
    return this.props.descricao;
  }

  public get data_hora_inicio() {
    return this.props.data_hora_inicio;
  }

  public get data_hora_fim() {
    return this.props.data_hora_fim;
  }

  public get limite_ingressos_cpf() {
    return this.props.limite_ingressos_cpf;
  }

  public get estado() {
    return this.props.estado;
  }

  public get criado_em() {
    return this.props.criado_em;
  }

  public alterarTitulo(novoTitulo: string): void {
    if (!novoTitulo.trim()) throw new Error('Título inválido');
    this.props.titulo = novoTitulo;
  }

  public alterarDescricao(novaDescricao: string): void {
    this.props.descricao = novaDescricao;
  }

  public alterarDatas(dataInicio: string, dataFim: string): void {
    if (!dataInicio || !dataFim) throw new Error('Datas inválidas');
    this.props.data_hora_inicio = dataInicio;
    this.props.data_hora_fim = dataFim;
  }

  public alterarLimiteIngressos(limite: number): void {
    if (limite < 0) throw new Error('Limite de ingressos inválido');
    this.props.limite_ingressos_cpf = limite;
  }
}