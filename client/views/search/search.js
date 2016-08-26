/* ---------------------------------------------------- +/

## Tipis ##

/+ ---------------------------------------------------- */

function hasValue(val) {
    return val != '';
}

function isAdvancedSearch() {
    return hasValue(this.fechadesde.value)
        || hasValue(this.fechahasta.value)
        || hasValue(this.lugar.value)
        || hasValue(this.ref.value)
        || hasValue(this.vtipo.value)
        || hasValue(this.titulo.value);
}

Template.search.onCreated(function () {
  var currentPage = new ReactiveVar(Session.get('current-page') || 0);
  this.currentPage = currentPage;
  this.autorun(function () {
    Session.set('current-page', currentPage.get());
  });
});

Template.search.helpers({
    alldicts_helper: function() {
        return Dicts.find({}, {sort: {dict: 1}}).fetch();
    },
    grupootro_helper: function() {
        return [
            {'value': 'Gobierno', 'text': 'Gobierno'},
            {'value': 'GC-CiU', 'text': 'Grupo Catalán (CiU)'},
            {'value': 'GIP', 'text': 'G.P. La Izquierda Plural'},
            {'value': 'GMx', 'text': 'G.P. Mixto'},
            {'value': 'GP', 'text': 'G.P. Popular'},
            {'value': 'GS', 'text': 'G.P. Socialista'},
            {'value': 'GUPyD', 'text': 'G.P. UPyD'},
            {'value': 'GV (EAJ-PNV)', 'text': 'G.P. Vasco (EAJ-PNV)'},
        ];    
    },
    lugares_helper: function() {
        return [
            "Comisión Constitucional",
            "Comisión de Agricultura, Alimentación y Medio Ambiente",
            "Comisión de Asuntos Exteriores",
            "Comisión de Cooperación Internacional para el Desarrollo",
            "Comisión de Cultura",
            "Comisión de Defensa",
            "Comisión de Economía y Competitividad",
            "Comisión de Educación y Deporte",
            "Comisión de Empleo y Seguridad Social",
            "Comisión de Fomento",
            "Comisión de Hacienda y Administraciones Públicas",
            "Comisión de Igualdad",
            "Comisión de Industria, Energía y Turismo",
            "Comisión de Interior",
            "Comisión de Justicia",
            "Comisión de Presupuestos",
            "Comisión de Sanidad y Servicios Sociales",
            "Pleno",
        ];
    },
    tipos_helper: function() {
      return [
        "Comisiones, Subcomisiones y Ponencias",
        /*"Comparecencia",*/
        /*"Enmienda a Moción",*/
        "Enmienda a Proposición de Ley",
        /*"Enmienda a Proposición no de Ley",*/
        "Enmienda a Proyecto de Ley",
        "Interpelación",
        "Moción consecuencia de Interpelación",
        "Planes, Programas y Dictámenes",
        "Pregunta oral",
        "Pregunta para respuesta escrita",
        "Proposición de Ley",
        "Proposición no de Ley",
        "Proyecto de Ley",
        "Real Decreto Legislativo",
        "Real Decreto Ley",
      ];
    },
    dip_autocomplete_settings: function() {
        return {
            position: "bottom",
            limit: 10,
            rules: [
                {
                    token: '',
                    collection: Diputados,
                    field: "nombre",
                    template: Template.dipAutocomplete
                }
            ]
        };
    },
    lastquery: function() {
        return Session.get("search");
    },
    count: function() {
        if (this.searched) {
            if (this.count == 0) {
                flash("No se han encontrado iniciativas que cumplan los criterios.", "danger");
            } else {
                if (this.count >= Meteor.settings.public.queryParams.limit) {
                    flash("Demasiadas iniciativas encontradas. Se mostrarán solo las " + Meteor.settings.public.queryParams.limit + " últimas.", "info");
                } else {
                    flash("Se han encontrado " + this.count + " iniciativas.", "info");
                }
            }
        }
    },
    arrayNumPages: function() {
        npages = Math.ceil(this.count / Meteor.settings.public.reactiveTable.rowsPerPage);
        if (npages > 1) {
            return [...Array(npages).keys()].map(x => x+1);
        } else {
            return [];
        }
    },
    hasPrevious: function() {
        if (Template.instance().currentPage.get() > 0) {
            return "";
        } else {
            return "disabled";
        }
    },
    hasNext: function() {
        if (Template.instance().currentPage.get() + 1 < Math.ceil(this.count / Meteor.settings.public.reactiveTable.rowsPerPage)) {
            return "";
        } else {
            return "disabled";
        }
    },
    currentPage: function() {
        return Template.instance().currentPage.get() + 1;
    },
    totalPages: function() {
        return Math.ceil(this.count / Meteor.settings.public.reactiveTable.rowsPerPage);
    },
    settings: function () {
        return {
            currentPage: Template.instance().currentPage,
            rowsPerPage: Meteor.settings.public.reactiveTable.rowsPerPage,
            showNavigation: 'never',
            showFilter: false,
            showColumnToggles: false,
            fields: [
                { key: 'titulo', label: 'Titulo', sortable: true, sortOrder: 1, sortDirection: -1, headerClass: 'col-md-7',
                    fn: function(val, obj) {
                        var str = '';
                        if (Roles.userIsInRole(Meteor.user(), ["admin"])) {
                            str += '<div class="btn-group">';
                              str += '<a href="#" class="btn btn-secondary btn-xs dropdown-toggle" data-toggle="dropdown"><i class="fa fa-caret-square-o-down"></i></a>';
                              str += '<ul class="dropdown-menu">';
                                str += '<li><a href="tipis/'+ obj._id + '"><i class="fa fa-file-o"></i> Ver iniciativa</a></li>';
                                str += '<li><a href="/admin/Tipis/'+ obj._id + '/edit"><i class="fa fa-pencil"></i> Editar iniciativa</a></li>';
                                str += '<li><a href="tipis/'+ obj.url + '"><i class="fa fa-institution"></i> Ver en Congreso.es</a></li>';
                              str += '</ul>';
                            str += '</div>';
                            str += '&nbsp;&nbsp;';
                        }
                        str += '<a href="/tipis/'+ obj._id + '"><strong>'+val+'</strong></a>';
                        return Spacebars.SafeString(str);
                    }
                },
                { key: 'autor_diputado',  label: 'Autor', sortable: false, headerClass: 'col-md-2',
                    fn: function(val, obj) {
                      if (!_.isNull(val)) {
                        if (val.length > 0) {
                            return Spacebars.SafeString(val.join([separator = '<br/>']));
                        } else {
                            if (obj.autor_otro.length > 0) {
                                return Spacebars.SafeString(obj.autor_otro.join([separator = '<br/>']));
                            }
                        }

                      } else {
                        return '';
                      }
                    }
                },
                { key: 'autor_grupo', label: 'Grupo', sortable: false, headerClass: 'col-md-2',
                    fn: function(val, obj) {
                        groupsHumanized = [];
                        for(i=0;i<val.length;i++) {
                            groupsHumanized.push(parliamentarygroups[val[i]]);
                        }
                        return groupsHumanized.join([separator = ', ']);
                    }
                },
                { key: 'fecha', label: 'Fecha', sortable: true, sortOrder: 0, sortDirection: -1, headerClass: 'col-md-1',
                    fn: function(val, obj) {
                        return moment(val).format('l');
                    }
                }
            ]
        };
    }
});


Template.search.rendered = function () {
  if(!this._rendered) {
      this._rendered = true;
      Session.set('searchUrl', window.location.href);
      $("#fechadesde").datepicker(datepickeroptions);
      $("#fechahasta").datepicker(datepickeroptions);
      if (isAdvancedSearch()) {
          $('.adv-search-block').show();
          $('.adv-search-link.hide-block').show();
      } else {
          $('.adv-search-block').hide();
          $('.adv-search-link.hide-block').hide();
      }
  }
};

Template.search.events({
    'submit form': function(e) { },
    'click a#exportcsv': function(e) {
        e.preventDefault();
        var query = Session.get("search");
        var collection_data = Tipis.find(cleanTipiQuery(query)).fetch();
        var data = json2csv(collection_data, true, true);
        var blob = new Blob([data], {type: "text/csv;charset=utf-8"});
        saveAs(blob, "tipis.csv");
    },
    'click .adv-search-link': function(e) {
        e.preventDefault();
        $(e.currentTarget).hide();
        $('.adv-search-block').toggle(0, function() {
            if ($('.adv-search-block').is(':visible'))
                $('.adv-search-link.hide-block').show();
            else 
                $('.adv-search-link.show-block').show();
        });
    },
    'click .pager .previous': function(e) {
        e.preventDefault();
        Template.instance().currentPage.set(parseInt(Template.instance().currentPage.get()) - 1);
        Session.set('current-page', Template.instance().currentPage.get());
        // Go to top after changing currentPage
        $('body').animate({ scrollTop: 0 }, 0);
    },
    'click .pager .next': function(e) {
        e.preventDefault();
        Template.instance().currentPage.set(parseInt(Template.instance().currentPage.get()) + 1);
        Session.set('current-page', Template.instance().currentPage.get());
        // Go to top after changing currentPage
        $('body').animate({ scrollTop: 0 }, 0);
    }
});
