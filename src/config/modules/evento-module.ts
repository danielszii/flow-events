import { CreateEvento } from "../../aplicacao/usecase/evento/CreateEvento";
import { ListEvento } from "../../aplicacao/usecase/evento/ListEvento";
import { DeleteEvento } from "../../aplicacao/usecase/evento/DeleteEvento";
import { GetEvento } from "../../aplicacao/usecase/evento/GetEvento";
import { UpdateEvento } from "../../aplicacao/usecase/evento/UpdateEvento";
import { PublicarEvento } from "../../aplicacao/usecase/evento/PublicarEvento";
import { EventoRepositorioMysql } from "../../infra/bd/mysql/EventoRepositorioMysql";
import { EventoControle } from "../../infra/web/express/controle/EventoControle";

const eventoRepositorio = new EventoRepositorioMysql();

const createEvento = new CreateEvento(eventoRepositorio);
const listEvento = new ListEvento(eventoRepositorio);
const deleteEvento = new DeleteEvento(eventoRepositorio);
const getEvento = new GetEvento(eventoRepositorio);
const updateEvento = new UpdateEvento(eventoRepositorio);
const publicarEvento = new PublicarEvento(eventoRepositorio);

export const eventoControle = new EventoControle(
  createEvento,
  listEvento,
  deleteEvento,
  getEvento,
  updateEvento,
  publicarEvento,
);