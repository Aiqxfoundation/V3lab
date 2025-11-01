import { useQuery } from "@tanstack/react-query";
import { type DeployedToken } from "@shared/schema";
import { TokenCard } from "@/components/token-card";
import { TokenSkeleton } from "@/components/token-skeleton";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTokenPolling } from "@/hooks/use-token-polling";

export default function Dashboard() {
  const { data: tokens, isLoading } = useQuery<DeployedToken[]>({
    queryKey: ["/api/tokens"],
  });

  useTokenPolling(true);

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Token Dashboard</h1>
              <p className="text-muted-foreground">
                Manage and monitor your deployed tokens
              </p>
            </div>
            <Link href="/create">
              <Button className="gap-2" data-testid="button-create-new">
                <Package className="h-4 w-4" />
                Create New Token
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TokenSkeleton />
            <TokenSkeleton />
            <TokenSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Token Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and monitor your deployed tokens
            </p>
          </div>
          <Link href="/create">
            <Button className="gap-2" data-testid="button-create-new">
              <Package className="h-4 w-4" />
              Create New Token
            </Button>
          </Link>
        </div>

        {!tokens || tokens.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tokens deployed yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first token to get started with AIQX Labs
            </p>
            <Link href="/create">
              <Button data-testid="button-create-first">Create Your First Token</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
