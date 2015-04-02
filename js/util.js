var VG_JSON_OBJ = null;
var VG_CART_COUNT = 0;
var VG_REPORT_TYPE = {
  VENDAS_PERIODO: 1,
  VENDAS_DIA_CATEGORIA: 2,
  VENDAS_CATEGORIA_HORARIO: 3
}

$('#modal-ok').on('click', function () {
  $('#nav-username').text('Bem vindo, ' + $('#login-user').val() + '!');
});

$('ul.dropdown-menu').on('click', 'li a', function() {
  var selText = $(this).text();
  if ($(this).parent().hasClass('disabled') == false) {
    $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  }
});

$('#dropEvent').on('click', function() {
  clearEventDataInput();
  
  $('#dropCategory').empty().parents('.btn-group').find('.dropdown-toggle').html('Selecione a categoria<span class="caret"></span>');
  
  var obj = JSON.parse($('#myJson').html());
  var items = [];  
  for (var i=0; i < obj.Events.length; i++){
    if (obj.Events[i].name.trim() == $('#comboEvent').text().trim()) {
      VG_JSON_OBJ = obj.Events[i];
      
      for (var key in obj.Events[i].category){
        if (obj.Events[i].category[key] != null){
          if (obj.Events[i].category[key].quantityAvailable != 0){
            items.push('<li><a href="#">' + key + '</a></li>');
          } else {
            items.push('<li class="disabled"><a href="#">' + key + ' (Esgotado)</a></li>');
          }
        }
      }
    }
  }
  $('#dropCategory').append(items.join(''));
});

$('#dropCategory').on('click', function() {
  clearEventDataInput();
  
  for (var key in VG_JSON_OBJ.category){
    if (key == $('#comboCategory').text().trim()) {
      $('#input-preco-unit').val(VG_JSON_OBJ.category[key].price.format(2, 3, '.', ','));
      $('#input-qtd-disp').val(VG_JSON_OBJ.category[key].quantityAvailable);
    }
  }
});

$('#add-to-cart').on('click', function() {
  if (isNaN($('#input-qtd').val()) || parseInt($('#input-qtd').val()) <= 0) {
    alert("Informe uma quantidade válida!");
  } else if (parseInt($('#input-qtd').val()) > parseInt($('#input-qtd-disp').val())) {
    alert("A quantidade máxima disponível para este setor é " + $('#input-qtd-disp').val() + "!");
  } else {
    $('#table-cart > tbody').append('<tr id="addr' + VG_CART_COUNT + '"><td>' + $('#comboEvent').text().trim() + '</td><td>' + $('#comboCategory').text().trim() + '</td><td>' + $('#input-preco-unit').val() + '</td><td>' + $('#input-qtd').val() + '</td><td>' + (parseFloat($('#input-preco-unit').val()) * parseInt($('#input-qtd').val())).format(2, 3, '.', ',') +'</td><td><input type="button" class="btn btn-danger btn-xs btn-remove-list-item" value="x"></td></tr>');

    VG_CART_COUNT++;
    
    updateTotal();
  }
});

$('#table-cart').on('click', 'input[type="button"]', function(e){
   $(this).closest('tr').remove()
   
   updateTotal();
})

$("#input-valor-recebido").change(function() {
  $(this).val(function(index, value) {
    if (!isNaN($('#input-valor-recebido').val())) {
      $('#input-troco').val((parseFloat(value) - parseFloat($('#input-preco-total').val())).format(2, 3, '.', ','));
    
      return parseFloat(value).format(2, 3, '.', ',');   
    }
  });
});

$('#btn-finalizar-venda').on('click', function() {
  if ($("#table-cart > tbody > *").length == 0) {
    alert("Nenhum produto adicionado ao carrinho!");
  } else if ($('#input-cpf').val() == '') {
    alert("Informe o CPF do cliente!");
  } else if (parseFloat($('#input-troco').val()) < 0 || $('#input-troco').val() == '' || isNaN(parseFloat($('#input-troco').val()))) {
    alert("Confira o valor recebido!");
  } else {
    alert("Venda registrada com sucesso! Proceda para o módulo financeiro.");
  }
});

$('#btn-cancelar-venda').on('click', function() {
  $('#dropEvent').empty().parents('.btn-group').find('.dropdown-toggle').html('Selecione o evento<span class="caret"></span>');
  loadEventCombo();
  
  $('#dropCategory').empty().parents('.btn-group').find('.dropdown-toggle').html('Selecione a categoria<span class="caret"></span>');
  
  $('#table-cart > tbody').empty();
  clearEventDataInput();
  clearSaleDataInput();
});

$('#dropRelatorio').on('click', function () {
  switch($('#comboRelatorio').text().trim()) {
      case "Vendas por período":
        $('#addon-filtro-inicio').html('Data Início');
        $('#addon-filtro-fim').html('Data Fim');

      
        $('#comboCategoryFiltro').html('Selecione a categoria<span class="caret"></span>');
        $('#comboCategoryFiltro').attr('disabled', true);
        $('#input-filtro-inicio').attr('disabled', false);
        $('#input-filtro-fim').attr('disabled', false);
      
        $("#input-filtro-inicio").mask("99/99/9999",{placeholder:"dd/mm/aaaa"});
        $("#input-filtro-fim").mask("99/99/9999",{placeholder:"dd/mm/aaaa"});
        break;
      case "Vendas por dia/categoria":
        $('#addon-filtro-inicio').html('Data Início');
        $('#addon-filtro-fim').html('Data Fim');

        $('#comboCategoryFiltro').attr('disabled', false);
        $('#input-filtro-inicio').attr('disabled', false);
        $('#input-filtro-fim').attr('disabled', false);
      
        $("#input-filtro-inicio").mask("99/99/9999",{placeholder:"dd/mm/aaaa"});
        $("#input-filtro-fim").mask("99/99/9999",{placeholder:"dd/mm/aaaa"});
        break;
      case "Vendas por categoria/hora":
        $('#addon-filtro-inicio').html('Hora Início');
        $('#addon-filtro-fim').html('Hora Fim');

        $('#comboCategoryFiltro').attr('disabled', false);
        $('#input-filtro-inicio').attr('disabled', false);
        $('#input-filtro-fim').attr('disabled', false);
      
        $("#input-filtro-inicio").mask("99:99",{placeholder:"HH:MM"});
        $("#input-filtro-fim").mask("99:99",{placeholder:"HH:MM"});
        break;
    }
});

$('#dropEventFiltro').on('click', function() {
  $('#dropCategoryFiltro').empty().parents('.btn-group').find('.dropdown-toggle').html('Selecione a categoria<span class="caret"></span>');
  
  var obj = JSON.parse($('#myJson').html());
  var items = [];
  
  items.push('<li><a href="#">Todas</a></li>');
  
  for (var i=0; i < obj.Events.length; i++){
    if (obj.Events[i].name.trim() == $('#comboEventFiltro').text().trim()) {
      VG_JSON_OBJ = obj.Events[i];
      
      for (var key in obj.Events[i].category){
        if (obj.Events[i].category[key] != null){
          items.push('<li><a href="#">' + key + '</a></li>');
        }
      }
    }
  }
  $('#dropCategoryFiltro').append(items.join(''));
});

$('#btn-generate-report').on('click', function() {
  var fEvento = null;
  var fCategoria = null;
  var fInicio = null;
  var fFim = null;
  
  if ($('#comboRelatorio').text().trim() == "Selecione o relatório") {
    alert("Selecione o relatório!");
  } else if ($('#comboEventFiltro').text().trim() == "Selecione o evento") {
    alert("Selecione o evento!");
  } else {
    switch($('#comboRelatorio').text().trim()) {
      case "Vendas por período":
        //IF DATE DIFF OK
        
        if ($('#comboEventFiltro').text().trim() != "Todos") {
          fEvento == $('#comboEventFiltro').text().trim();
        }
        
        new generateReport(VG_REPORT_TYPE.VENDAS_PERIODO, fEvento, fCategoria, fInicio, fFim);

        break;
      case "Vendas por dia/categoria":
        //IF DATE DIFF OK
        
        if ($('#comboCategoryFiltro').text().trim() == "Selecione a categoria") {
          alert("Selecione a categoria!");
        } else {
          if ($('#comboEventFiltro').text().trim() != "Todos") {
            fEvento == $('#comboEventFiltro').text().trim();
          }

          if ($('#comboCategoryFiltro').text().trim() != "Todas") {
            fCategoria == $('#comboCategoryFiltro').text().trim();
          }

          new generateReport(VG_REPORT_TYPE.VENDAS_DIA_CATEGORIA, fEvento, fCategoria, fInicio, fFim);
        }
        
        break;
      case "Vendas por categoria/hora":
        if ($('#comboCategoryFiltro').text().trim() == "Selecione a categoria") {
          alert("Selecione a categoria!");
        } else {
          if ($('#comboEventFiltro').text().trim() != "Todos") {
            fEvento == $('#comboEventFiltro').text().trim();
          }

          if ($('#comboCategoryFiltro').text().trim() != "Todas") {
            fCategoria == $('#comboCategoryFiltro').text().trim();
          }

          new generateReport(VG_REPORT_TYPE.VENDAS_CATEGORIA_HORARIO, fEvento, fCategoria, fInicio, fFim);
        }

        break;
    }
  }
});

function updateTotal() {
  var sum = 0;

  var cells = document.querySelectorAll("td:nth-of-type(5)");

  for (var i = 0; i < cells.length; i++)
      sum+=parseFloat(cells[i].firstChild.data);
  
  $('#input-preco-total').val(sum.format(2, 3, '.', ','));
}

function clearEventDataInput() {
  $('#input-preco-unit').val('');
  $('#input-qtd-disp').val('');
  $('#input-qtd').val('');
}

function clearSaleDataInput() {
  $('#input-preco-total').val('');
  $('#input-cpf').val('');
  $('#input-valor-recebido').val('');
  $('#input-troco').val('');
}

function getNewDate(oldDate, diff) {
  var someDate = new Date(oldDate.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
  someDate.setDate(someDate.getDate() + diff); 
  
  var dd = someDate.getDate();
  var mm = someDate.getMonth() + 1;
  var y = someDate.getFullYear();

  return dd + '/'+ mm + '/'+ y;
}

function loadEventCombo() {
  var obj = JSON.parse($('#myJson').html());
  var items = [];
  var itemsFiltro = [];
  for (var i=0; i < obj.Events.length; i++){
    if (obj.Events[i].status == 1){
      items.push('<li><a href="#">' + obj.Events[i].name + '</a></li>');
    } else {
      items.push('<li class="disabled"><a href="#">' + obj.Events[i].name + ' (Disponível em ' + getNewDate(obj.Events[i].date, -30) + ')</a></li>'); 
    }
    itemsFiltro.push('<li><a href="#">' + obj.Events[i].name + '</a></li>');
  }
  $('#dropEvent').append(items.join(''));
  $('#dropEventFiltro').append(itemsFiltro.join(''));
  $('#dropGerenciarEvento').append(itemsFiltro.join(''));
}

function isValidDate(s) {
  var bits = s.split('/');
  var d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && (d.getMonth() + 1) == bits[1] && d.getDate() == Number(bits[0]);
} 

Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};