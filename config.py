HOST = "localhost"

# Todos os servidores disponíveis (inicie todos antes de rodar o cliente)
ALL_SERVERS = [
    (HOST, 5001),
    (HOST, 5002),
    (HOST, 5003),
    (HOST, 5004),
]

# Configurações a testar: (nº de servidores, label)
SERVER_CONFIGS = [2, 4]

BUFFER_SIZE = 8192

TEST_SIZES = [10, 50, 100, 500, 1000, 5000]

# Tamanho máximo de matriz para exibir completa no terminal
MAX_DISPLAY_SIZE = 10

# Tamanho máximo de matriz para salvar em arquivo txt
MAX_FILE_SIZE = 100
