import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { CreateEvento } from "../src/aplicacao/usecase/evento/CreateEvento";
import { DeleteEvento } from "../src/aplicacao/usecase/evento/DeleteEvento";
import { GetEvento } from "../src/aplicacao/usecase/evento/GetEvento";
import { ListEvento } from "../src/aplicacao/usecase/evento/ListEvento";
import { PublicarEvento } from "../src/aplicacao/usecase/evento/PublicarEvento";
import { UpdateEvento } from "../src/aplicacao/usecase/evento/UpdateEvento";
import { Evento } from "../src/dominio/entidades/Evento";
import { EventoRepositorio } from "../src/dominio/repositorios/EventoRepositorio";
import { EventoControle } from "../src/infra/web/express/controle/EventoControle";
import { createEventoRoutes } from "../src/infra/web/express/routes/EventoRoutes";

function criarApp(eventoInicial: Evento | null) {
  let eventoSalvo = eventoInicial;
  const repositorio: EventoRepositorio = {
    buscarPorId: async (id) => eventoSalvo?.id === id ? eventoSalvo : null,
    listar: async () => eventoSalvo ? [eventoSalvo] : [],
    salvar: async (evento) => {
      eventoSalvo = evento;
    },
    remover: async (id) => {
      if (eventoSalvo?.id !== id) {
        return false;
      }
      eventoSalvo = null;
      return true;
    },
    atualizar: async (evento) => {
      eventoSalvo = evento;
    },
  };

  const controle = new EventoControle(
    new CreateEvento(repositorio),
    new ListEvento(repositorio),
    new DeleteEvento(repositorio),
    new GetEvento(repositorio),
    new UpdateEvento(repositorio),
    new PublicarEvento(repositorio),
  );
  const app = express();
  app.use(createEventoRoutes(controle));
  return app;
}

async function comServidor<T>(
  app: ReturnType<typeof express>,
  executar: (url: string) => Promise<T>,
): Promise<T> {
  const server = app.listen(0);

  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Servidor de teste não abriu uma porta TCP");
    }

    return await executar(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function criarEvento(): Evento {
  return Evento.create(
    "Evento de teste",
    "Descrição",
    "2030-01-01T00:00:00.000Z",
    "2030-12-31T23:59:59.000Z",
    4,
  );
}

test("publica evento em rascunho pela API", async () => {
  const evento = criarEvento();
  const app = criarApp(evento);

  await comServidor(app, async (url) => {
    const response = await fetch(`${url}/eventos/${evento.id}/publicar`, {
      method: "POST",
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.data.id, evento.id);
    assert.equal(body.data.estado, "PUBLICADO");
  });
});

test("retorna 404 quando o evento não existe", async () => {
  const app = criarApp(null);

  await comServidor(app, async (url) => {
    const response = await fetch(`${url}/eventos/inexistente/publicar`, {
      method: "POST",
    });

    assert.equal(response.status, 404);
  });
});

test("retorna 409 ao tentar publicar evento que já foi publicado", async () => {
  const evento = criarEvento();
  evento.publicar();
  const app = criarApp(evento);

  await comServidor(app, async (url) => {
    const response = await fetch(`${url}/eventos/${evento.id}/publicar`, {
      method: "POST",
    });

    assert.equal(response.status, 409);
  });
});
