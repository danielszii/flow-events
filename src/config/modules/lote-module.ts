import { CreateLote } from "../../aplicacao/usecase/lote/CreateLote";
import { ListLotes } from "../../aplicacao/usecase/lote/ListLotes";
import { EventoRepositorioPostgres } from "../../infra/bd/postgres/EventoRepositorioPostgres";
import { LoteRepositorioPostgres } from "../../infra/bd/postgres/LoteRepositorioPostgres";
import { LoteControle } from "../../infra/web/express/controle/LoteControle";

const loteRepositorio = new LoteRepositorioPostgres();
const eventoRepositorio = new EventoRepositorioPostgres();

const createLote = new CreateLote(loteRepositorio, eventoRepositorio);
const listLotes = new ListLotes(loteRepositorio, eventoRepositorio);

export const loteControle = new LoteControle(createLote, listLotes);
