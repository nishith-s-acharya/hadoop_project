import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Search, Filter, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

export interface ThreatFilters {
  search: string;
  severity: string[];
  threatType: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface ThreatFiltersProps {
  filters: ThreatFilters;
  onFiltersChange: (filters: ThreatFilters) => void;
}

const severityOptions = ['critical', 'high', 'medium', 'low'];
const threatTypeOptions = [
  { value: 'failed_login', label: 'Failed Login' },
  { value: 'port_scan', label: 'Port Scan' },
  { value: 'brute_force', label: 'Brute Force' },
  { value: 'malware', label: 'Malware' },
  { value: 'ddos', label: 'DDoS' },
];

export function ThreatFiltersComponent({ filters, onFiltersChange }: ThreatFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleSeverity = (severity: string) => {
    const newSeverities = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    onFiltersChange({ ...filters, severity: newSeverities });
  };

  const toggleThreatType = (type: string) => {
    const newTypes = filters.threatType.includes(type)
      ? filters.threatType.filter(t => t !== type)
      : [...filters.threatType, type];
    onFiltersChange({ ...filters, threatType: newTypes });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      severity: [],
      threatType: [],
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const activeFilterCount =
    filters.severity.length +
    filters.threatType.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by IP, description..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 font-mono text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-primary/10 border-primary")}
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-4 animate-fade-in">
          {/* Severity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</label>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((severity) => (
                <Badge
                  key={severity}
                  variant={filters.severity.includes(severity) ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer uppercase text-[10px] transition-all",
                    filters.severity.includes(severity) && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleSeverity(severity)}
                >
                  {severity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Threat Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Threat Type</label>
            <div className="flex flex-wrap gap-2">
              {threatTypeOptions.map((type) => (
                <Badge
                  key={type.value}
                  variant={filters.threatType.includes(type.value) ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer text-[10px] transition-all",
                    filters.threatType.includes(type.value) && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleThreatType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="font-mono text-xs">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {filters.dateFrom ? format(filters.dateFrom, 'MMM d') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="font-mono text-xs">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {filters.dateTo ? format(filters.dateTo, 'MMM d') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs font-mono text-muted-foreground"
            >
              <X className="mr-1 h-3 w-3" /> Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
