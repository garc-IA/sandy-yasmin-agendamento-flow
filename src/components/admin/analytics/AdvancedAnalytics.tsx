
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Mock data
const monthlyData = [
  { month: 'Jan', agendamentos: 120, receita: 15000, cancelamentos: 8 },
  { month: 'Fev', agendamentos: 135, receita: 18000, cancelamentos: 5 },
  { month: 'Mar', agendamentos: 148, receita: 22000, cancelamentos: 12 },
  { month: 'Abr', agendamentos: 162, receita: 25000, cancelamentos: 7 },
  { month: 'Mai', agendamentos: 178, receita: 28000, cancelamentos: 9 },
  { month: 'Jun', agendamentos: 195, receita: 32000, cancelamentos: 6 },
];

const serviceData = [
  { name: 'Corte Feminino', value: 35, color: '#8884d8' },
  { name: 'Coloração', value: 25, color: '#82ca9d' },
  { name: 'Escova', value: 20, color: '#ffc658' },
  { name: 'Manicure', value: 15, color: '#ff7300' },
  { name: 'Outros', value: 5, color: '#d084d0' },
];

const weeklyHours = [
  { day: 'Seg', ocupacao: 75 },
  { day: 'Ter', ocupacao: 85 },
  { day: 'Qua', ocupacao: 92 },
  { day: 'Qui', ocupacao: 88 },
  { day: 'Sex', ocupacao: 95 },
  { day: 'Sáb', ocupacao: 98 },
  { day: 'Dom', ocupacao: 45 },
];

export function AdvancedAnalytics() {
  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">195</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 32.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Ocupação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Agendamentos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Agendamentos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="agendamentos" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                <Line type="monotone" dataKey="receita" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Serviços Mais Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
          </CardContent>
        </Card>

        {/* Ocupação por Dia da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Ocupação por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
                <Bar dataKey="ocupacao" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge variant="secondary" className="mt-1">Insight</Badge>
            <div>
              <h4 className="font-medium">Crescimento Consistente</h4>
              <p className="text-sm text-muted-foreground">
                Seus agendamentos têm crescido consistentemente nos últimos 6 meses. 
                Continue investindo em marketing e qualidade do serviço.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="secondary" className="mt-1">Recomendação</Badge>
            <div>
              <h4 className="font-medium">Otimizar Domingo</h4>
              <p className="text-sm text-muted-foreground">
                A ocupação aos domingos está baixa (45%). Considere promoções especiais 
                ou horários reduzidos para otimizar custos.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="secondary" className="mt-1">Oportunidade</Badge>
            <div>
              <h4 className="font-medium">Expandir Serviços</h4>
              <p className="text-sm text-muted-foreground">
                Com 87% de ocupação, há espaço para expandir o horário de funcionamento 
                ou adicionar novos profissionais nos dias de maior demanda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
