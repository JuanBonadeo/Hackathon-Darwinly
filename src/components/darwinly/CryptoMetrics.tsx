'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { CryptoData } from "@/lib/apis/coinmarketcap"

interface CryptoMetricsProps {
  data: CryptoData
}

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  return `$${price.toFixed(6)}`
}

function formatMarketCap(mc: number): string {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`
  return `$${mc.toLocaleString()}`
}

function PriceChange({ value }: { value: number }) {
  const isPositive = value >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const color = isPositive ? "text-green-500" : "text-red-500"

  return (
    <span className={`flex items-center gap-1 text-sm font-semibold ${color}`}>
      <Icon className="h-4 w-4" />
      {isPositive ? "+" : ""}{value.toFixed(2)}%
    </span>
  )
}

export function CryptoMetrics({ data }: CryptoMetricsProps) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">&#8383;</span>
          Crypto Metrics
        </CardTitle>
        <CardDescription>
          {data.name} ({data.symbol}) &middot; Rank #{data.rank}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Current Price */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current Price</p>
          <p className="text-3xl font-bold">{formatPrice(data.currentPrice)}</p>
        </div>

        {/* Price Changes */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h</p>
            <PriceChange value={data.priceChange24h} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">7d</p>
            <PriceChange value={data.priceChange7d} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">30d</p>
            <PriceChange value={data.priceChange30d} />
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
            <p className="text-lg font-semibold">{formatMarketCap(data.marketCap)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
            <p className="text-lg font-semibold">{formatMarketCap(data.volume24h)}</p>
          </div>
        </div>

        {/* ATH */}
        {data.ath.price > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">All-Time High</p>
            <p className="text-lg font-semibold">{formatPrice(data.ath.price)}</p>
            {data.ath.date && (
              <p className="text-xs text-muted-foreground">
                {new Date(data.ath.date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  )
}
