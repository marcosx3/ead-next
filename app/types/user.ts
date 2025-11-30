export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'pending' | 'inactive';
  userType: 'interno' | 'externo';
};

export const userData: User[] = [
  { id: "1", name: "Alice Silva", email: "alice@example.com", role: "admin", status: "active", userType: "interno" },
  { id: "2", name: "Bruno Costa", email: "bruno@example.com", role: "user", status: "pending", userType: "externo" },
  { id: "3", name: "Cecília Reis", email: "cecilia@example.com", role: "user", status: "active", userType: "interno" },
  { id: "4", name: "David Santos", email: "david@example.com", role: "guest", status: "inactive", userType: "externo" },
  { id: "5", name: "Eva Mendes", email: "eva@example.com", role: "admin", status: "active", userType: "interno" },

  { id: "6", name: "Fábio Almeida", email: "fabio@example.com", role: "user", status: "active", userType: "externo" },
  { id: "7", name: "Gabriela Rocha", email: "gabriela@example.com", role: "admin", status: "pending", userType: "interno" },
  { id: "8", name: "Henrique Ramos", email: "henrique@example.com", role: "guest", status: "inactive", userType: "externo" },
  { id: "9", name: "Isabela Nunes", email: "isabela@example.com", role: "user", status: "active", userType: "interno" },
  { id: "10", name: "Jorge Matos", email: "jorge@example.com", role: "user", status: "pending", userType: "interno" },

  { id: "11", name: "Karina Duarte", email: "karina@example.com", role: "admin", status: "active", userType: "externo" },
  { id: "12", name: "Lucas Freitas", email: "lucas@example.com", role: "guest", status: "inactive", userType: "interno" },
  { id: "13", name: "Mariana Prado", email: "mariana@example.com", role: "user", status: "active", userType: "externo" },
  { id: "14", name: "Nathan Borges", email: "nathan@example.com", role: "user", status: "pending", userType: "interno" },
  { id: "15", name: "Olívia Tavares", email: "olivia@example.com", role: "admin", status: "active", userType: "interno" },

  { id: "16", name: "Paulo Xavier", email: "paulo@example.com", role: "guest", status: "inactive", userType: "externo" },
  { id: "17", name: "Queila Andrade", email: "queila@example.com", role: "user", status: "active", userType: "interno" },
  { id: "18", name: "Rafael Farias", email: "rafael@example.com", role: "user", status: "pending", userType: "externo" },
  { id: "19", name: "Sandra Luz", email: "sandra@example.com", role: "admin", status: "active", userType: "externo" },
  { id: "20", name: "Tiago Moura", email: "tiago@example.com", role: "guest", status: "inactive", userType: "interno" },

   { id: "21", name: "Ursula Braga", email: "ursula@example.com", role: "user", status: "active", userType: "externo" },
  { id: "22", name: "Vitor Azevedo", email: "vitor@example.com", role: "user", status: "pending", userType: "interno" },
  { id: "23", name: "Wesley Ramos", email: "wesley@example.com", role: "admin", status: "active", userType: "externo" },
  { id: "24", name: "Xênia Campos", email: "xenia@example.com", role: "guest", status: "inactive", userType: "interno" },
  { id: "25", name: "Yara Vasconcelos", email: "yara@example.com", role: "user", status: "active", userType: "interno" },

  { id: "26", name: "Zeca Pinto", email: "zeca@example.com", role: "user", status: "pending", userType: "externo" },
  { id: "27", name: "Amanda Ribeiro", email: "amanda@example.com", role: "admin", status: "active", userType: "interno" },
  { id: "28", name: "Beto Moraes", email: "beto@example.com", role: "guest", status: "inactive", userType: "externo" },
  { id: "29", name: "Carla Porto", email: "carla@example.com", role: "user", status: "active", userType: "interno" },
  { id: "30", name: "Danilo Rocha", email: "danilo@example.com", role: "user", status: "pending", userType: "interno" },

  { id: "31", name: "Elaine Teixeira", email: "elaine@example.com", role: "admin", status: "active", userType: "externo" },
  { id: "32", name: "Fernando Rios", email: "fernando@example.com", role: "guest", status: "inactive", userType: "interno" },
  { id: "33", name: "Gisele Maia", email: "gisele@example.com", role: "user", status: "active", userType: "externo" },
  { id: "34", name: "Hugo Cavalcante", email: "hugo@example.com", role: "user", status: "pending", userType: "interno" },
  { id: "35", name: "Ingrid Torres", email: "ingrid@example.com", role: "admin", status: "active", userType: "interno" },
];
