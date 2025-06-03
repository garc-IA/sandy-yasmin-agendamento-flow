
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Clock, DollarSign, Calendar, Star } from "lucide-react";

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 4500, appointments: 45 },
  { month: 'Fev', revenue: 5200, appointments: 52 },
  { month: 'Mar', revenue: 4800, appointments: 48 },
  { month: 'Abr', revenue: 6100, appointments: 61 },
  { month: 'Mai', revenue: 5700, appointments: 57 },
  { month: 'Jun', revenue: 6800, appointments: 68 },
];

const professionalData = [
  { name: 'Sandy', appointments: 45, revenue: 4500, rating: 4.8 },
  { name: 'Yasmin', appointments: 38, revenue: 3800, rating: 4.9 },
  { name: 'Maria', appointments: 32, revenue: 3200, rating: 4.7 },
];

const timeData = [
  { hour: '09:00', appointments: 8 },
  { hour: '10:00', appointments: 12 },
  { hour: '11:00', appointments: 15 },
  { hour: '12:00', appointments: 10 },
  { hour: '13:00', appointments: 8 },
  { hour: '14:00', appointments: 18 },
  { hour: '15:00', appointments: 20 },
  { hour: '16:00', appointments: 16 },
  { hour: '17:00', appointments: 14 },
  { hour: '18:00', appointments: 12 },
];

const serviceData = [
  { name: 'Corte', value: 35, color: '#8884d8' },
  { name: 'Manicure', value: 25, color: '#82ca9d' },
  { name: 'Pedicure', value: 20, color: '#ffc658' },
  { name: 'Sobrancelha', value: 15, color: '#ff7c7c' },
  { name: 'Outros', value: 5, color: '#8dd1e1' },
];

export function AdvancedAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-green-600">+5%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Recorrentes</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-blue-600">+3%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">45min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-orange-600">-2min</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ 85</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-green-600">+R$ 5</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="professionals">Profissionais</TabsTrigger>
          <TabsTrigger value="schedule">Horários</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Receita e Agendamentos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Receita (R$)" />
                  <Bar yAxisId="right" dataKey="appointments" fill="#82ca9d" name="Agendamentos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professionals">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professionalData.map((prof) => (
                  <div key={prof.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{prof.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {prof.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {prof.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{prof.appointments} agendamentos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Agendamentos por Horário</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Agendamentos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {serviceData.map((service) => (
                    <div key={service.name} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="text-sm">{service.name}</span>
                      <Badge variant="outline">{service.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
