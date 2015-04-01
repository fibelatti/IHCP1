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

$('#btn-generate-report').on('click', function() {
  //TODO: ADICIONAR VALIDAÇÕES DOS FILTROS E APLICAR AS VARIÁVEIS
  
  
  new generateReport(VG_REPORT_TYPE.VENDAS_CATEGORIA_HORARIO);
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
  for (var i=0; i < obj.Events.length; i++){
    if (obj.Events[i].status == 1){
      items.push('<li><a href="#">' + obj.Events[i].name + '</a></li>');
    } else {
     items.push('<li class="disabled"><a href="#">' + obj.Events[i].name + ' (Disponível em ' + getNewDate(obj.Events[i].date, -30) + ')</a></li>'); 
    }
  }
  $('#dropEvent').append(items.join(''));
}

Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};