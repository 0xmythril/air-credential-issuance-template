"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CredentialSchema {
  id: string;
  name: string;
  dataSource: string;
  description: string;
  route: string;
  fields: string[];
  color: string;
  apis: string[];
}

// Color mapping for data sources
const DATA_SOURCE_COLORS: Record<string, string> = {
  Twitter: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  Spotify: "bg-green-500/10 text-green-500 border border-green-500/20",
  Discord: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
  Wallet: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
};

const CREDENTIAL_SCHEMAS: CredentialSchema[] = [
  {
    id: "twitter",
    name: "Twitter Credential",
    dataSource: "Twitter",
    description: "Stores your Twitter profile including username, followers, following count, tweets count, verification status, bio, location, and account creation date.",
    route: "/twitter",
    fields: ["username", "name", "verified", "followers", "following", "tweets", "listed", "bio", "location", "joined"],
    color: DATA_SOURCE_COLORS.Twitter,
    apis: ["Twitter OAuth 2.0", "Twitter API v2"],
  },
  {
    id: "spotify",
    name: "Music Credential",
    dataSource: "Spotify",
    description: "Stores your music taste including Spotify ID, top artists, top tracks, followed artists, music diversity score, top genres, and total followed artists count.",
    route: "/spotify",
    fields: ["spotify_id", "followed_artists", "top_artists", "top_tracks", "music_diversity_score", "top_genres", "total_followed_artists"],
    color: DATA_SOURCE_COLORS.Spotify,
    apis: ["Spotify Web API", "Spotify OAuth"],
  },
  {
    id: "ethos",
    name: "Ethos Credential",
    dataSource: "Wallet",
    description: "Stores your wallet reputation including wallet address, Ethos score, and reputation level.",
    route: "/ethos",
    fields: ["address", "score", "level"],
    color: DATA_SOURCE_COLORS.Wallet,
    apis: ["Ethos API", "Web3 Provider"],
  },
  {
    id: "discord",
    name: "Discord Credential",
    dataSource: "Discord",
    description: "Stores your Discord profile including user ID, username, discriminator, server counts, connections, global name, verification status, locale, premium status, and public flags.",
    route: "/discord",
    fields: ["discord_id", "username", "discriminator", "guilds_count", "owned_guilds_count", "connections_count", "global_name", "verified", "locale", "premium_type", "public_flags"],
    color: DATA_SOURCE_COLORS.Discord,
    apis: ["Discord OAuth2", "Discord API"],
  },
];

type SortField = "name" | "dataSource";
type SortDirection = "asc" | "desc";

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataSourceFilter, setDataSourceFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get unique data sources for filter
  const dataSources = useMemo(() => {
    return Array.from(new Set(CREDENTIAL_SCHEMAS.map(schema => schema.dataSource)));
  }, []);

  // Filter and sort credentials
  const filteredAndSortedSchemas = useMemo(() => {
    let filtered = CREDENTIAL_SCHEMAS;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        schema =>
          schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          schema.dataSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
          schema.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply data source filter
    if (dataSourceFilter !== "all") {
      filtered = filtered.filter(schema => schema.dataSource === dataSourceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchQuery, dataSourceFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleIssue = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Explore Credentials</h1>
          <p className="text-muted-foreground">
            Discover all available credential types you can issue and store securely on the blockchain.
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Credentials</CardDescription>
              <CardTitle className="text-3xl">{CREDENTIAL_SCHEMAS.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Data Sources</CardDescription>
              <CardTitle className="text-3xl">{dataSources.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Results</CardDescription>
              <CardTitle className="text-3xl">{filteredAndSortedSchemas.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search credentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Data Source Filter */}
              <div className="w-full md:w-64">
                <Select value={dataSourceFilter} onValueChange={setDataSourceFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {dataSources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                      >
                        Name
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("dataSource")}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                      >
                        Data Source
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>APIs Used</TableHead>
                    <TableHead className="max-w-md">Description</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSchemas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No credentials found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedSchemas.map((schema) => (
                      <TableRow key={schema.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{schema.name}</TableCell>
                        <TableCell>
                          <Badge className={schema.color} variant="outline">
                            {schema.dataSource}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {schema.apis.map((api, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground"
                              >
                                {api}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {schema.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleIssue(schema.route)}
                            size="sm"
                            variant="default"
                          >
                            Issue
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              All credentials are securely stored on the Moca blockchain using AIR Kit. 
              Click &ldquo;Issue Credential&rdquo; to authenticate with the respective platform and create your verifiable credential.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

