document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const uploadMessage = document.getElementById("uploadMessage");
  const fileList = document.getElementById("fileList");
  const searchInput = document.getElementById("searchInput"); // Barra de pesquisa
  const fileTypeSelect = document.getElementById("fileTypeSelect"); // Dropdown para tipos de arquivo

  // Função para exibir mensagens de sucesso/erro
  function setMessage(message, isSuccess = true) {
    uploadMessage.textContent = message;
    uploadMessage.style.color = isSuccess ? "#28a745" : "#dc3545";
  }

  // Função para fazer o upload de um arquivo
  uploadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      setMessage("Por favor, selecione um arquivo para enviar.", false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setMessage("Enviando arquivo...");

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setMessage("Upload realizado com sucesso!");
          fileInput.value = ""; // Limpa o campo de arquivo
          loadFiles(); // Atualiza a lista de arquivos
        } else {
          setMessage("Erro ao enviar o arquivo.", false);
        }
      })
      .catch((error) => {
        setMessage("Erro na conexão com o servidor.", false);
      });
  });

  // Função para carregar a lista de arquivos
  function loadFiles() {
    fileList.innerHTML = "<p>Carregando arquivos...</p>"; // Mensagem de carregamento

    fetch("/files")
      .then((response) => response.json())
      .then((files) => {
        fileList.innerHTML = ""; // Limpa a lista de arquivos
        if (files.length === 0) {
          fileList.innerHTML = "<p>Nenhum arquivo disponível.</p>";
        } else {
          // Função para exibir os arquivos filtrados
          const filteredFiles = filterFiles(
            files,
            searchInput.value,
            fileTypeSelect.value
          );

          console.log(files)
          console.log(filteredFiles)

          if (filteredFiles.length === 0) {
            fileList.innerHTML =
              "<p>Nenhum arquivo corresponde aos filtros.</p>";
          } else {
            filteredFiles.forEach((file) => {
              const fileItem = document.createElement("div");
              fileItem.className = "file-item";

              const fileIcon = document.createElement("div");
              fileIcon.className = "file-icon";
              fileIcon.innerHTML = getFileIcon(file.content_type);

              const fileName = document.createElement("div");
              fileName.className = "file-name";
              fileName.textContent = file.filename;

              const downloadLink = document.createElement("a");
              downloadLink.href = `/download/${file.filename}`;
              downloadLink.textContent = "Baixar";
              downloadLink.setAttribute("target", "_blank");

              fileItem.appendChild(fileIcon);
              fileItem.appendChild(fileName);
              fileItem.appendChild(downloadLink);
              fileList.appendChild(fileItem);
            });
          }
        }
      })
      .catch((error) => {
        fileList.innerHTML =
          '<p id="errorMessage">Erro ao carregar a lista de arquivos.</p>';
      });
  }

  // Função para filtrar arquivos pelo nome e tipo
  function filterFiles(files, searchQuery, fileType) {
    return files.filter((file) => {
      const matchesName = file.filename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        fileType === "" || file.content_type.includes(fileType);
      return matchesName && matchesType;
    });
  }

  // Função para obter o ícone do arquivo com base no tipo MIME
  function getFileIcon(contentType) {
    if (contentType.includes("pdf")) {
      return "📄"; // Ícone para PDF
    } else if (contentType.includes("image")) {
      return "🖼️"; // Ícone para imagens
    } else if (contentType.includes("word")) {
      return "📄"; // Ícone para documentos do Word
    } else if (contentType.includes("csv")) {
      return "📊"; // Ícone para arquivos CSV
    } else if (contentType.includes("excel")) {
      return "📊"; // Ícone para planilhas do Excel
    } else {
      return "📁"; // Ícone genérico para outros tipos de arquivo
    }
  }

  // Carregar arquivos ao digitar no campo de busca
  searchInput.addEventListener("input", loadFiles);

  // Carregar arquivos ao selecionar um tipo no dropdown
  fileTypeSelect.addEventListener("change", loadFiles);

  // Carrega a lista de arquivos quando a página é carregada
  loadFiles();
});
