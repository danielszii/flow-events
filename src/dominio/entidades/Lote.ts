import { LoteInvalidoError } from "../erros/LoteInvalidoError";

export type LoteProps = {
  id: string;
  evento_id: string;
  nome: string;
  preco: number;
  quantidade_total: number;
  data_hora_inicio_venda: string;
  data_hora_fim_venda: string;
  criado_em: string;
}

export class Lote {
  private constructor(private props: LoteProps) {}

  public static create(
    evento_id: string,
    nome: string,
    preco: number,
    quantidade_total: number,
    data_hora_inicio_venda: string,
    data_hora_fim_venda: string,
  ): Lote {
    if (!evento_id || !evento_id.trim()) {
      throw new LoteInvalidoError("ID do evento é obrigatório");
    }
    if (!nome || !nome.trim()) {
      throw new LoteInvalidoError("Nome do lote é obrigatório");
    }
    if (!Number.isFinite(preco) || preco < 0) {
      throw new LoteInvalidoError("Preço do lote inválido");
    }
    if (!Number.isInteger(quantidade_total) || quantidade_total <= 0) {
      throw new LoteInvalidoError("Quantidade total do lote deve ser um inteiro positivo");
    }

    const inicioVenda = new Date(data_hora_inicio_venda);
    const fimVenda = new Date(data_hora_fim_venda);

    if (!data_hora_inicio_venda || Number.isNaN(inicioVenda.getTime())) {
      throw new LoteInvalidoError("Data de início das vendas inválida");
    }
    if (!data_hora_fim_venda || Number.isNaN(fimVenda.getTime())) {
      throw new LoteInvalidoError("Data de fim das vendas inválida");
    }
    if (inicioVenda >= fimVenda) {
      throw new LoteInvalidoError("Início das vendas deve ser anterior ao fim das vendas");
    }

    return new Lote({
      id: crypto.randomUUID(),
      evento_id: evento_id.trim(),
      nome: nome.trim(),
      preco,
      quantidade_total,
      data_hora_inicio_venda: inicioVenda.toISOString(),
      data_hora_fim_venda: fimVenda.toISOString(),
      criado_em: new Date().toISOString(),
    });
  }

  public static fromPersistence(props: LoteProps): Lote {
    return new Lote({ ...props });
  }

  public toPersistence(): LoteProps {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
  }

  public get evento_id() {
    return this.props.evento_id;
  }

  public get nome() {
    return this.props.nome;
  }

  public get preco() {
    return this.props.preco;
  }

  public get quantidade_total() {
    return this.props.quantidade_total;
  }

  public get data_hora_inicio_venda() {
    return this.props.data_hora_inicio_venda;
  }

  public get data_hora_fim_venda() {
    return this.props.data_hora_fim_venda;
  }

  public get criado_em() {
    return this.props.criado_em;
  }

  public vendasAbertasEm(data: Date = new Date()): boolean {
    const instante = data.getTime();
    return Number.isFinite(instante)
      && instante >= new Date(this.props.data_hora_inicio_venda).getTime()
      && instante < new Date(this.props.data_hora_fim_venda).getTime();
  }
}
