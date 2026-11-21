import { CreateLote } from "../../aplicacao/usecase/lote/CreateLote";
import { ListLotes } from "../../aplicacao/usecase/lote/ListLotes";
import { EventoRepositorioMysql } from "../../infra/bd/mysql/EventoRepositorioMysql";
import { LoteRepositorioMysql } from "../../infra/bd/mysql/LoteRepositorioMysql";
import { LoteControle } from "../../infra/web/express/controle/LoteControle";

const loteRepositorio = new LoteRepositorioMysql();
const eventoRepositorio = new EventoRepositorioMysql();

const createLote = new CreateLote(loteRepositorio, eventoRepositorio);
const listLotes = new ListLotes(loteRepositorio, eventoRepositorio);

export const loteControle = new LoteControle(createLote, listLotes);
