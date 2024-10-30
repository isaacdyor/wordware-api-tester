import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Braces, Check, Copy, Table } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

// Code block component with syntax highlighting and copy functionality
const CodeBlock = ({
  inline,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace(/language-/, "");

  if (inline) {
    return (
      <code className="rounded bg-secondary px-1 py-0.5 text-sm" {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(children as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="mb-4 mt-2 overflow-x-auto rounded-lg bg-secondary p-4">
        <div className="absolute right-2 top-2 flex items-center gap-2">
          {language && (
            <span className="text-xs text-muted-foreground">{language}</span>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="transition-all hover:border-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// Enhanced markdown components with proper spacing and styling
const MarkdownComponents = {
  h1: ({ ...props }) => (
    <h1
      className="mb-6 mt-8 border-b pb-2 text-3xl font-bold tracking-tight"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="mb-4 mt-6 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3 className="mb-3 mt-5 text-xl font-semibold tracking-tight" {...props} />
  ),
  h4: ({ ...props }) => (
    <h4 className="mb-2 mt-4 text-lg font-semibold tracking-tight" {...props} />
  ),
  h5: ({ ...props }) => (
    <h5
      className="mb-2 mt-3 text-base font-semibold tracking-tight"
      {...props}
    />
  ),
  h6: ({ ...props }) => (
    <h6 className="mb-2 mt-3 text-sm font-semibold tracking-tight" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="mb-4 leading-7 [&:not(:first-child)]:mt-4" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="mb-4 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mb-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: ({ ...props }) => <li className="leading-7" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote
      className="mt-6 border-l-4 border-muted pl-6 italic text-muted-foreground"
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-6 border-muted" {...props} />,
  table: ({ ...props }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  th: ({ ...props }) => (
    <th
      className="border border-muted px-4 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td className="border border-muted px-4 py-2 text-left" {...props} />
  ),
  a: ({ ...props }) => (
    <a
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      {...props}
    />
  ),
  img: ({
    src,
    alt,
    width,
    height,
    ...props
  }: React.ComponentPropsWithoutRef<"img">) => (
    <Image
      src={src || ""}
      alt={alt || "image"}
      className="rounded-lg border"
      width={typeof width === "string" ? parseInt(width, 10) : width || 500}
      height={typeof height === "string" ? parseInt(height, 10) : height || 300}
      {...props}
    />
  ),
  code: CodeBlock,
};

export function Output({
  runOutputs,
}: {
  runOutputs: Record<string, unknown>;
}) {
  const [jsonView, setJsonView] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (autoScroll && scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [runOutputs, autoScroll]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isScrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
      setAutoScroll(isScrolledToBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const renderValue = (value: unknown) => {
    if (typeof value === "string") {
      return (
        <ReactMarkdown className="max-w-none" components={MarkdownComponents}>
          {value}
        </ReactMarkdown>
      );
    }
    return (
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
        {typeof value === "object"
          ? JSON.stringify(value, null, 2)
          : String(value)}
      </pre>
    );
  };

  return (
    <Card className="flex h-full w-full">
      <CardContent className="group relative flex-1 pr-1 pt-6">
        <div
          ref={scrollContainerRef}
          className="scrollbar-w-0 h-full overflow-y-auto rounded-lg pr-5"
        >
          {jsonView ? (
            <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {JSON.stringify(runOutputs, null, 2)}
            </pre>
          ) : (
            <div className="space-y-8">
              {Object.entries(runOutputs).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-2">
                  <h2 className="mb-2 text-3xl font-bold text-primary">
                    {key}
                  </h2>
                  {renderValue(value)}
                </div>
              ))}
            </div>
          )}
        </div>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                onClick={() => setJsonView(!jsonView)}
              >
                {jsonView ? (
                  <Table className="h-4 w-4" />
                ) : (
                  <Braces className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{jsonView ? "Formatted View" : "JSON View"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
