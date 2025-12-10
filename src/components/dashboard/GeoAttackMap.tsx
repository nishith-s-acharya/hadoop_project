import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateGeoData } from "@/lib/mock-data";
import { useMemo } from "react";
import { Globe, MapPin } from "lucide-react";

export function GeoAttackMap() {
  const geoData = useMemo(() => generateGeoData(), []);
  const maxAttacks = Math.max(...geoData.map(d => d.attacks));

  return (
    <Card variant="cyber" className="col-span-full lg:col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          Attack Origins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {geoData.slice(0, 8).map((item, index) => (
            <div 
              key={item.country} 
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-3 w-3 text-destructive" />
                  {item.country}
                </span>
                <span className="font-mono text-muted-foreground">
                  {item.attacks.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={(item.attacks / maxAttacks) * 100} 
                  className="h-2 bg-secondary"
                />
                <div 
                  className="absolute inset-0 h-2 rounded-full opacity-50"
                  style={{
                    background: `linear-gradient(90deg, hsl(0, 85%, 55%) 0%, hsl(38, 92%, 50%) 100%)`,
                    width: `${(item.attacks / maxAttacks) * 100}%`,
                    filter: 'blur(4px)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
