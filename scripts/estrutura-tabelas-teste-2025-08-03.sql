
-- ===========================================
-- Tabela: conta
-- ===========================================

CREATE TABLE conta (
  conta_id integer(32) DEFAULT nextval('conta_conta_id_seq'::regclass) NOT NULL,
  conta_nome character varying(100) NOT NULL,
  conta_tipo character varying(50) NOT NULL,
  conta_saldo numeric(10,2) DEFAULT 0.00,
  usuario_id integer(32) NOT NULL,
  conta_ativo boolean DEFAULT true,
  conta_dtcriacao timestamp without time zone DEFAULT now(),
  conta_dtatualizacao timestamp without time zone DEFAULT now(),
  conta_dtdelete timestamp without time zone
  PRIMARY KEY (conta_id),
  CONSTRAINT conta_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id)
);

-- Índices para conta


-- ===========================================
-- Tabela: despesa
-- ===========================================

CREATE TABLE despesa (
  despesa_id integer(32) DEFAULT nextval('despesa_despesa_id_seq'::regclass) NOT NULL,
  despesa_descricao character varying(255) NOT NULL,
  despesa_valor numeric(10,2) NOT NULL,
  despesa_data date NOT NULL,
  despesa_tipo character varying(50) NOT NULL,
  usuario_id integer(32),
  despesa_ativo boolean DEFAULT true,
  despesa_dtdelete timestamp without time zone,
  despesa_usuariodelete integer(32),
  despesa_dtcriacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  despesa_dtatualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  despesa_pago boolean DEFAULT false,
  despesa_dtvencimento date,
  conta_id integer(32),
  despesa_recorrente boolean DEFAULT false,
  despesa_frequencia character varying(20) DEFAULT 'mensal'::character varying,
  despesa_proximasparcelas integer(32) DEFAULT 12,
  despesa_datainiciorecorrencia date,
  despesa_datafimrecorrencia date,
  despesa_categoria character varying(100) DEFAULT 'Geral'::character varying NOT NULL,
  despesa_datavencimento date,
  despesa_observacoes text,
  despesa_datacriacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  despesa_dataatualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (despesa_id),
  CONSTRAINT despesa_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id),
  CONSTRAINT despesa_despesa_usuariodelete_fkey FOREIGN KEY (despesa_usuariodelete) REFERENCES usuario(usuario_id),
  CONSTRAINT despesa_conta_id_fkey FOREIGN KEY (conta_id) REFERENCES conta(conta_id)
);

-- Índices para despesa
CREATE INDEX idx_despesa_usuario_id ON public.despesa USING btree (usuario_id);
CREATE INDEX idx_despesa_despesa_data ON public.despesa USING btree (despesa_data);
CREATE INDEX idx_despesa_despesa_ativo ON public.despesa USING btree (despesa_ativo);
CREATE INDEX idx_despesa_recorrente ON public.despesa USING btree (despesa_recorrente, despesa_datainiciorecorrencia);


-- ===========================================
-- Tabela: lembretesenviados
-- ===========================================

CREATE TABLE lembretesenviados (
  lembrete_id integer(32) DEFAULT nextval('lembretesenviados_lembrete_id_seq'::regclass) NOT NULL,
  usuario_id integer(32),
  tipo character varying(20) NOT NULL,
  item_id integer(32) NOT NULL,
  dataenvio timestamp without time zone DEFAULT now(),
  datavencimento date NOT NULL,
  status character varying(20) DEFAULT 'enviado'::character varying
  PRIMARY KEY (lembrete_id),
  CONSTRAINT lembretesenviados_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id)
);

-- Índices para lembretesenviados
CREATE INDEX idx_lembretes_usuario ON public.lembretesenviados USING btree (usuario_id, datavencimento);
CREATE INDEX idx_lembretes_status ON public.lembretesenviados USING btree (status, dataenvio);


-- ===========================================
-- Tabela: receita
-- ===========================================

CREATE TABLE receita (
  receita_id integer(32) DEFAULT nextval('receita_receita_id_seq'::regclass) NOT NULL,
  receita_descricao character varying(255) NOT NULL,
  receita_valor numeric(10,2) NOT NULL,
  receita_data date NOT NULL,
  receita_tipo character varying(50) NOT NULL,
  usuario_id integer(32),
  receita_ativo boolean DEFAULT true,
  receita_dtdelete timestamp without time zone,
  receita_usuariodelete integer(32),
  receita_dtcriacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  receita_dtatualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  conta_id integer(32),
  receita_recebido boolean DEFAULT false,
  receita_recorrente boolean DEFAULT false,
  receita_frequencia character varying(20) DEFAULT 'mensal'::character varying,
  receita_proximasparcelas integer(32) DEFAULT 12,
  receita_datainiciorecorrencia date,
  receita_datafimrecorrencia date,
  receita_categoria character varying(100) DEFAULT 'Geral'::character varying NOT NULL,
  receita_observacoes text,
  receita_datacriacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  receita_dataatualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (receita_id),
  CONSTRAINT receita_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id),
  CONSTRAINT receita_receita_usuariodelete_fkey FOREIGN KEY (receita_usuariodelete) REFERENCES usuario(usuario_id),
  CONSTRAINT receita_conta_id_fkey FOREIGN KEY (conta_id) REFERENCES conta(conta_id)
);

-- Índices para receita
CREATE INDEX idx_receita_usuario_id ON public.receita USING btree (usuario_id);
CREATE INDEX idx_receita_receita_data ON public.receita USING btree (receita_data);
CREATE INDEX idx_receita_receia_ativo ON public.receita USING btree (receita_ativo);
CREATE INDEX idx_receita_recorrente ON public.receita USING btree (receita_recorrente, receita_datainiciorecorrencia);


-- ===========================================
-- Tabela: usuario
-- ===========================================

CREATE TABLE usuario (
  usuario_id integer(32) DEFAULT nextval('usuario_usuario_id_seq'::regclass) NOT NULL,
  usuario_email character varying(255) NOT NULL,
  usuario_senha character varying(255) NOT NULL,
  usuario_nome character varying(255) NOT NULL,
  usuario_telefone character varying(20),
  usuario_dtcriacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  usuario_dtatualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  usuario_ativo boolean DEFAULT true,
  usuario_resettoken character varying(255),
  usuario_resetexpiry timestamp without time zone,
  usuario_lembretesativos boolean DEFAULT true,
  usuario_lembretesemail boolean DEFAULT true,
  usuario_lembretesdiasantes integer(32) DEFAULT 5
  PRIMARY KEY (usuario_id)
);

-- Índices para usuario
CREATE UNIQUE INDEX usuario_usuario_email_key ON public.usuario USING btree (usuario_email);
CREATE INDEX idx_usuario_reset_token ON public.usuario USING btree (usuario_resettoken);


-- ===========================================
-- Tabela: versao_sistema
-- ===========================================

CREATE TABLE versao_sistema (
  versao_id integer(32) DEFAULT nextval('versao_sistema_versao_id_seq'::regclass) NOT NULL,
  versao_numero character varying(20) NOT NULL,
  versao_nome character varying(100) NOT NULL,
  versao_data date NOT NULL,
  versao_descricao text,
  versao_status character varying(20) DEFAULT 'ATIVA'::character varying,
  versao_ambiente character varying(20) DEFAULT 'PRODUCAO'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (versao_id)
);

-- Índices para versao_sistema
CREATE INDEX idx_versao_status ON public.versao_sistema USING btree (versao_status);
CREATE INDEX idx_versao_ambiente ON public.versao_sistema USING btree (versao_ambiente);

