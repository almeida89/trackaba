import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Image as ImageIcon, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUCKET = "anexos-criancas";
const MAX_MB = 20;
const TIPOS_ACEITOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface Props {
  criancaId: string;
  /** Subpasta dentro da pasta da criança (ex.: `sessoes/${sessaoId}`). Padrão: raiz da criança. */
  pasta?: string;
  /** Override de título do card. */
  titulo?: string;
  /** Override de descrição do card. */
  descricao?: string;
  /** Quando true, desabilita upload e remoção (ex.: sessão assinada). */
  bloqueado?: boolean;
}

interface Arquivo {
  name: string;
  path: string;
  size: number;
  updated_at: string | null;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnexosCrianca({ criancaId, pasta, titulo, descricao, bloqueado = false }: Props) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const pastaBase = pasta ? `${criancaId}/${pasta}` : criancaId;
  const queryKey = ["anexos-crianca", pastaBase];

  const { data: arquivos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<Arquivo[]> => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(pastaBase, { limit: 100, sortBy: { column: "updated_at", order: "desc" } });
      if (error) throw error;
      return (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => ({
          name: f.name,
          path: `${pastaBase}/${f.name}`,
          size: (f.metadata?.size as number) ?? 0,
          updated_at: f.updated_at ?? f.created_at ?? null,
        }));
    },
  });

  const validarArquivo = (a: File): string | null => {
    if (!TIPOS_ACEITOS.includes(a.type)) return "Tipo não permitido (use PDF ou imagem)";
    if (a.size > MAX_MB * 1024 * 1024) return `Arquivo maior que ${MAX_MB}MB`;
    return null;
  };

  const enviarArquivos = useCallback(
    async (lista: FileList | File[]) => {
      const arr = Array.from(lista);
      if (arr.length === 0) return;
      setEnviando(true);
      let ok = 0;
      let erro = 0;
      for (const arquivo of arr) {
        const erroValid = validarArquivo(arquivo);
        if (erroValid) {
          toast.error(`${arquivo.name}: ${erroValid}`);
          erro++;
          continue;
        }
        const ext = arquivo.name.split(".").pop()?.toLowerCase() || "bin";
        const base = arquivo.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60);
        const caminho = `${pastaBase}/${Date.now()}-${base}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });
        if (error) {
          toast.error(`Erro em ${arquivo.name}: ${error.message}`);
          erro++;
        } else {
          ok++;
        }
      }
      setEnviando(false);
      if (ok > 0) toast.success(`${ok} arquivo(s) enviado(s)`);
      queryClient.invalidateQueries({ queryKey });
    },
    [pastaBase, queryClient]
  );

  const aoSelecionar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files;
    e.target.value = "";
    if (f && f.length) enviarArquivos(f);
  };

  const aoSoltar = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files?.length) enviarArquivos(e.dataTransfer.files);
  };

  const mutBaixar = useMutation({
    mutationFn: async (arq: Arquivo) => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(arq.path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    },
    onError: (e: Error) => toast.error("Erro ao gerar link: " + e.message),
  });

  const mutRemover = useMutation({
    mutationFn: async (arq: Arquivo) => {
      const { error } = await supabase.storage.from(BUCKET).remove([arq.path]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Arquivo removido");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error("Erro ao remover: " + e.message),
  });

  const nomeBonito = (nome: string) =>
    nome.replace(/^\d{10,}-/, "");

  const ehImagem = (nome: string) => /\.(png|jpe?g|webp|gif)$/i.test(nome);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">{titulo ?? "Anexos"}</CardTitle>
        <CardDescription>
          {descricao ??
            `Documentos, laudos, fotos e relatórios da criança. Máx. ${MAX_MB}MB por arquivo.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {bloqueado ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Sessão assinada — upload e remoção de anexos bloqueados.
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={aoSoltar}
            onClick={() => !enviando && inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              arrastando
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
              enviando && "opacity-60 pointer-events-none"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={TIPOS_ACEITOS.join(",")}
              className="hidden"
              onChange={aoSelecionar}
            />
            <div className="flex flex-col items-center gap-2">
              {enviando ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm font-medium text-foreground">
                {enviando ? "Enviando arquivos..." : "Arraste arquivos aqui ou clique para selecionar"}
              </p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG, WEBP ou GIF</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Arquivos {arquivos.length > 0 && <span className="text-muted-foreground font-normal">({arquivos.length})</span>}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : arquivos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum arquivo enviado ainda.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {arquivos.map((arq) => {
                const Icone = ehImagem(arq.name) ? ImageIcon : FileText;
                const removendo = mutRemover.isPending && mutRemover.variables?.path === arq.path;
                const baixando = mutBaixar.isPending && mutBaixar.variables?.path === arq.path;
                return (
                  <li key={arq.path} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate" title={nomeBonito(arq.name)}>
                        {nomeBonito(arq.name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatarTamanho(arq.size)} • {formatarData(arq.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => mutBaixar.mutate(arq)}
                        disabled={baixando}
                        title="Baixar"
                      >
                        {baixando ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remover "${nomeBonito(arq.name)}"?`)) mutRemover.mutate(arq);
                        }}
                        disabled={removendo || bloqueado}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title={bloqueado ? "Sessão assinada — remoção bloqueada" : "Remover"}
                      >
                        {removendo ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
