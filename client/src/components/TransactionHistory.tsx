import { useState, useMemo } from 'react';
import { useTransactions, type Transaction } from '@/contexts/TransactionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Package,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SUPPORTED_CHAINS } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface TransactionHistoryProps {
  filterType?: Transaction['type'];
  chainId?: number;
  maxHeight?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export function TransactionHistory({
  filterType,
  chainId,
  maxHeight = '600px',
  showFilters = true,
  compact = false,
}: TransactionHistoryProps) {
  const { transactions, clearTransactions } = useTransactions();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Transaction['status'] | 'all'>('all');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply prop filters
    if (filterType) {
      filtered = filtered.filter(tx => tx.type === filterType);
    }
    if (chainId) {
      filtered = filtered.filter(tx => tx.chainId === chainId);
    }

    // Apply user filters
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.hash?.toLowerCase().includes(query) ||
        tx.description.toLowerCase().includes(query) ||
        tx.from?.toLowerCase().includes(query) ||
        tx.to?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, filterType, chainId, typeFilter, statusFilter, searchQuery]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deployment':
        return <Package className="h-4 w-4" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'multisend':
        return <ArrowDownLeft className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const getChainName = (chainId: number) => {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  const getExplorerUrl = (tx: Transaction) => {
    if (!tx.explorerUrl && tx.chainId && tx.hash) {
      const chain = Object.values(SUPPORTED_CHAINS).find(c => c.chainId === tx.chainId);
      if (chain?.explorerUrl) {
        return `${chain.explorerUrl}/tx/${tx.hash}`;
      }
    }
    return tx.explorerUrl;
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transaction history?')) {
      clearTransactions();
      toast({
        title: 'History Cleared',
        description: 'Transaction history has been cleared',
      });
    }
  };

  if (compact && filteredTransactions.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            No transactions yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Transaction History</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          {!compact && transactions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-red-500 hover:text-red-600"
              data-testid="button-clear-history"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && !compact && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by hash, address, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-transactions"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-[140px]" data-testid="select-type-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deployment">Deployment</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="multisend">Multisend</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="burn">Burn</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="w-full" style={{ height: maxHeight }}>
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'No transactions match your filters'
                    : 'No transactions yet'}
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  data-testid={`transaction-item-${tx.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(tx.type)}
                        <span className="font-medium text-sm">{tx.description}</span>
                        <Badge variant={getStatusBadgeVariant(tx.status)} className="ml-auto">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(tx.status)}
                            {tx.status}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono">
                          {tx.hash ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}` : 'No hash'}
                        </span>
                        {tx.hash && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => copyToClipboard(tx.hash, 'Transaction hash')}
                            data-testid={`button-copy-hash-${tx.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                        <span>•</span>
                        <span>{getChainName(tx.chainId)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                      </div>

                      {tx.error && tx.status === 'failed' && (
                        <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                          {tx.error}
                        </div>
                      )}
                    </div>

                    {getExplorerUrl(tx) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="flex-shrink-0"
                        data-testid={`button-explorer-${tx.id}`}
                      >
                        <a
                          href={getExplorerUrl(tx)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}