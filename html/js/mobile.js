//Get url parameters
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function () {
    //Select correct subtab based on url
    var tab = getParameterByName('tabsection');

    if (tab.length) {
        $('#myTab a[href="#' + tab + '"]').tab('show');
    } else {
        $('#myTab a.default-tab').tab('show');
    }

    //Adds tabsection to url for tab-panes which will have
    //multiple levels; preserves navigation by back button
    $('#myTab a.multi-level').click(function () {
        var current = document.location.search;
        var addTab = $(this).attr('href').substring(1);
        document.location.search = current + '&tabsection=' + addTab;
    });

    //Handle document downloads
    $('a.doc-item').click(function () {
        var itemId = $(this).attr('data-id');
        var itemExt = $(this).attr('data-ext');
        if (itemExt === 'url') {
            $.post('lib/php/data/cases_documents_process.php',
            {'item_id': itemId, 'action': 'open', 'doc_type': 'document'},
            function (data) {
                var serverResponse = $.parseJSON(data);
                window.open(serverResponse.target_url, '_blank');
            });
        } else if (itemExt === 'ccd') {
            $.post('lib/php/data/cases_documents_process.php',
            {'item_id': itemId, 'action': 'open', 'doc_type': 'document'},
            function (data) {
                var serverResponse = $.parseJSON(data);
                var ccdItem = '<a class="ccd-clear" href="#">Back</a><h2>' + unescape(serverResponse.ccd_title) + '</h2>' + serverResponse.ccd_content;
                var hideList = $('.doc-list').detach();
                $('#caseDocs').append(ccdItem);
                console.log(serverResponse);
                //Close a ccd document after viewing
                $('.tab-content').on('click', 'a.ccd-clear', function () {
                    $('#caseDocs').html('').append(hideList);
                });
            });
        } else {
            $.download('lib/php/data/cases_documents_process.php', {'item_id': itemId, 'action': 'open', 'doc_type': 'document'});
        }
    });

    //Add chosen to selects
    //Must initialize with size on hidden div: see https://github.com/harvesthq/chosen/issues/1297
    $('#ev_users').chosen({ width: '16em' });

    //Submit Quick Adds
    //Case notes
    $.validator.addMethod('timeReq', function (value) {
        return !(value === '0' && $('select[name="csenote_hours"]').val() === '0');
    }, 'You must enter some time.');

    $('form[name="quick_cn"]').validate({
        errorClass: 'text-error',
        errorElement: 'span',
        rules: {
            csenote_minutes: {timeReq: true}
        }
    });

    $('form[name="quick_cn"]').submit(function (event) {
        event.preventDefault();
        var form = $(this);
        var dateVal = $('select[name="c_month"]').val() + '/' + $('select[name="c_day"]').val() + '/' + $('select[name="c_year"]').val();
        $('input[name="csenote_date"]').val(dateVal);

        $.post('lib/php/data/cases_casenotes_process.php', form.serialize(), function (data) {
            var serverResponse = $.parseJSON(data);
            if (serverResponse.error === true) {
                $('p.error').html(serverResponse.message);
            } else {
                var successMsg = '<p class="text-success">' + serverResponse.message +
                '</p><p><a class="btn show-form" href="#">Add Another?</a></p>';
                form[0].reset();
                var hideForm = $('form[name="quick_cn"]').detach();
                $('#qaCaseNote').append(successMsg);
                $('a.show-form').click(function () {
                    $('#qaCaseNote').html('').append(hideForm);
                });
            }
        });

    });

    //Case events
    $('form[name="quick_event"]').validate({
        errorClass: 'text-error',
        errorElement: 'span'
    });

    //Convenience method for advancing end date
    $('form[name="quick_event"] div.date-picker:eq(0) select').change(function () {
        var el = $(this).attr('name');
        $(this).closest('.date-picker').siblings('.date-picker').find('select[name=' + el + ']').val($(this).val());
    });

    $('form[name="quick_event"]').submit(function (event) {
        event.preventDefault();
        var form = $(this);
        var startVal = $('select[name="c_month"]').eq(0).val() + '/' + $('select[name="c_day"]').eq(0).val() +
        '/' + $('select[name="c_year"]').eq(0).val() + ' ' +  $('select[name="c_hours"]').eq(0).val() +
        ':' + $('select[name="c_minutes"]').eq(0).val() +
        ' ' + $('select[name="c_ampm"]').eq(0).val();
        $('input[name="start"]').val(startVal);

        var endVal = $('select[name="c_month"]').eq(1).val() + '/' + $('select[name="c_day"]').eq(1).val() +
        '/' + $('select[name="c_year"]').eq(1).val() + ' ' +  $('select[name="c_hours"]').eq(1).val() +
        ':' + $('select[name="c_minutes"]').eq(1).val() +
        ' ' + $('select[name="c_ampm"]').eq(1).val();
        $('input[name="end"]').val(endVal);

        //serialize form values
        var evVals = form.not('select[name="responsibles"]').serializeArray();
        var resps = form.find('select[name="responsibles"]').val();
        var resps_obj = $.extend({}, resps);
        evVals.unshift(resps_obj); //put this object at the beginning
        var allDayVal = null;
        if (form.find('input[name = "all_day"]').is(':checked')) {
            allDayVal = 'on';
        } else {
            allDayVal = 'off';
        }
        
        $.post('lib/php/data/cases_events_process.php', {
            'task': form.find('input[name = "task"]').val(),
            'where': form.find('input[name = "where"]').val(),
            'start': form.find('input[name = "start"]').val(),
            'end': form.find('input[name = "end"]').val(),
            'all_day': allDayVal,
            'notes': form.find('textarea[name = "notes"]').val(),
            'responsibles': resps,
            'action': 'add',
            'case_id': form.find('select[name = "case_id"]').val()
        }, function (data) {
            var serverResponse = $.parseJSON(data);
            if (serverResponse.error === true) {
                $('p.error').html(serverResponse.message);
            } else {
                var successMsg = '<p class="text-success">' + serverResponse.message +
                '</p><p><a class="btn show-form" href="#">Add Another?</a></p>';
                form[0].reset();
                $('#ev_users').trigger("liszt:updated")
                var hideForm = $('form[name="quick_event"]').detach();
                $('#qaEvent').append(successMsg);
                $('a.show-form').click(function () {
                    $('#qaEvent').html('').append(hideForm);
                });
            }
        });

    });
});