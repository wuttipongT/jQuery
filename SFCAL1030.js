(function($) {
    //declare Global variable...
    var DG_PCBA = $('#DG_PCBA'),
        DG_BALANCE = $('#DG_BALANCE'),
        OP_PCBA = {
            sScrollY: 184,
            scrollX: true,
            scrollCollapse: true,
            bProcessing: true,
            bPaginate: false,
            bInfo: false,
            bFilter: false,
            sPaginationType: 'full_numbers',
            sDom: 't',
            columns: [
                { "data": "PCBASN", "title": "PCBASN" },
                { "data": "PANEL_ID", "title": "PANEL ID" },
                { "data": "PCBA_ID", "title": "PCBA ID" },
            ]
        },
        OP_BAL = {
            sScrollY: OP_PCBA.sScrollY,
            scrollX: OP_PCBA.scrollX,
            scrollCollapse: OP_PCBA.scrollCollapse,
            bProcessing: OP_PCBA.bProcessing,
            bPaginate: OP_PCBA.bPaginate,
            bInfo: OP_PCBA.bInfo,
            bFilter: OP_PCBA.bFilter,
            sPaginationType: OP_PCBA.sPaginationType,
            sDom: OP_PCBA.sDom,
            columns: [
                { "data": "ROWNUM", "title": "NO" },
                { "data": "PARTCD", "title": "PARTCD" },
                { "data": "BALANCE", "title": "BALANCE" },
            ]
        },
        PCBA_table = DG_PCBA.DataTable(OP_PCBA),
        PCBA_apiTable = DG_PCBA.dataTable(),
        BALANCE_table = DG_BALANCE.DataTable(OP_BAL),
        BALANCE_apiTable = DG_BALANCE.dataTable(),
        url = 'AJAX_SFCAL1030.php',
        body = $('body'),
        lblResult = $("p[name='lblResult']")

    nPARTLESS = 0,
        nPANELID = 1,
        nPrint = 1,
        bFormLoad = 'false', // default false
        line_name = 'A',
        station_name = 'PCBA_LABEL',
        version = '1.0.0.6', //default value,
        spin = $("<span/>", { class: 'glyphicon glyphicon-refresh spinning', style: 'vertical-align:bottom;margin-left: 5px;' })

    var $LblAppVer = $("span[name='LblAppVer']"),
        //Last update information
        $LblLASTWWYY = $("label[name='LblLASTWWYY']"),
        $LblLASTNO = $("label[name='LblLASTNO']"),
        $LblLASTPANELID = $("input[name='LblLASTPANELID']"),
        $LblMAIN = $("label[name='LblMAIN']"),
        $LblSTARTNO = $("label[name='LblSTARTNO']"),
        $LblENDNO = $("label[name='LblENDNO']"),
        //PARAMETER INFORMATION
        $LblM = $("label[name='LblM']"),
        $LblPRODCD = $("label[name='LblPRODCD']"),
        $LblLINECD = $("label[name='LblLINECD']"),
        $LblT = $("label[name='LblT']"),
        $LblD = $("label[name='LblD']"),
        $LblWW = $("label[name='LblWW']"),
        $LblYY = $("label[name='LblYY']"),
        //CONTROL
        $BtPRINT = $("button[name='BtPRINT']"),
        $LblPRINTQTY = $("label[name='LblPRINTQTY']"),
        $LblLOTQTY = $("label[name='LblLOTQTY']"),
        //INPUT DETAIL
        $QST10_ORDNO = $("input[name='QST10_ORDNO']"),
        $SCC11_TMPCBSN = $("input[name='SCC11_TMPCBSN']"),
        $CmbSMTLINE = $("select[name='CmbSMTLINE']"),
        $TxtPANELQTY = $("input[name='TxtPANELQTY']"),
        $TxtPCBAQTY = $("input[name='TxtPCBAQTY']"),
        $TxtTOTAL = $("span[name='TxtTOTAL']"),

        //PRINT INFORMATION
        $LblWDPCBAPN = $("span[name='LblWDPCBAPN']"),
        $LblPCBAVER = $("span[name='LblPCBAVER']"),
        $LblLASTPRINT = $("span[name='LblLASTPRINT']"),
        $lblResult = $("p[name='lblResult']")
    $.SFCAL1030 = function() {
        this.formLoad(() => this.run())
    }
    $.SFCAL1030.prototype = {
        constructor: $.SFCAL1030,
        run: function() {
            debugger;
            $BtPRINT.on('click', event => {
                event.preventDefault()
                alert('ok')
            })
            $QST10_ORDNO.on('keydown', event => {
                if (event.keyCode === 13) {
                    event.preventDefault()
                    if (!$QST10_ORDNO.val()) {
                        alert('Please enter value..')
                        return
                    }
                    var $transport = {
                        aMode: 'ordno_keydown',
                        ordno: $QST10_ORDNO.val(),
                        linecd: $LblLINECD.text(),
                    }
                    this.$_ajax($transport).then(result => {
                        $LblPRINTQTY.text('0');
                        $LblLOTQTY.text(result.ChkLOTQTY)
                        if ($LblLOTQTY.text() === '0') {
                            alert($QST10_ORDNO.Text & " is not found!!", MsgBoxStyle.Critical)
                            $QST10_ORDNO.text('')
                            $QST10_ORDNO.focus()
                        } else {
                            $LblPRINTQTY.text(result.CHECK_PRINTQTY)
                            this.DispPartBalance(result.DispPartBalance);
                            $SCC11_TMPCBSN.focus()
                        }
                    })
                }
            })
            $TxtPANELQTY.on('keydown', event => {
                if (event.keyCode === 13) {
                    event.preventDefault()
                    this.$TxtPCBAQTY.focus()
                }
            })
            $TxtPANELQTY.on('input', event => {
                event.preventDefault()
                if (bFormLoad === 'true') //bFormLoad
                {
                    this.checkInputStatus(result => {
                        if (result == true) {
                            $BtPRINT.removeAttr('disabled')
                        } else {
                            $BtPRINT.attr('disabled', 'disabled')
                        }
                    })
                }
            })
            $TxtPCBAQTY.on('keydown', event => {
                if (event.keyCode === 13) {
                    this.checkInputStatus(result => {
                        if (result == true) {
                            $BtPRINT.removeAttr('disabled')
                        } else {
                            $BtPRINT.attr('disabled', 'disabled')
                        }
                    })
                }
            })
            $SCC11_TMPCBSN.on('keydown', event => {
                if (event.keyCode === 13) {
                    event.preventDefault()
                    var $transport = {
                        aMode: 'tmpcbsn_keydown',
                        SCC11_TMPCBSN: $SCC11_TMPCBSN.val(),
                        bFormLoad: bFormLoad,
                        CmbSMTLINE: $CmbSMTLINE.val(),
                    }
                    this.$_ajax($transport).then(result => {
                        if (result.ChkPCBAPN === "") {
                            $SCC11_TMPCBSN.text('')
                            $LblPCBAVER.text('')
                            $LblWDPCBAPN.text('')
                            $LblPRODCD.text("????")
                        } else {
                            $LblMAIN.text(this.MXXXXLTDWWYY(result.MXXXXLTDWWYY))
                            $CmbSMTLINE.focus()
                        }
                    })
                }
            })
        },
        formLoad: function(callback) {
            debugger;
            this.genPCBALabel(() => this.getSmtLine(() => {
                bFormLoad = 'true'
                callback()
            }))
        },
        genPCBALabel: function(callback) {
            try {
                var $transport = {
                    aMode: 'genPCBALabel',
                    line_name: line_name,
                    SCC11_TMPCBSN: $SCC11_TMPCBSN.val(),
                    bFormLoad: bFormLoad, //bFormLoad
                    CmbSMTLINE: $CmbSMTLINE.val(),
                    running: 'false'
                }
                this.$_ajax($transport).then(result => {
                    if (result.e) {
                        console.log(result.message)
                    }

                    $LblMAIN.text(this.MXXXXLTDWWYY(result.MXXXXLTDWWYY))
                    $LblWDPCBAPN.text()
                    $LblPCBAVER.text()
                    $TxtTOTAL.text()

                    $LblLASTNO.text('00000')
                    $LblLASTWWYY.text('')
                    debugger;
                    callback()
                })
            } catch (e) {
                throw e
            }
        },
        MXXXXLTDWWYY: function(result) {
            try {
                var item = result.items
                if (bFormLoad === 'true') {
                    var pcb = item.SFCCPCBAPN
                    if (item.SCC11_NROW > 0) {
                        $LblPCBAVER.text(pcb.SCC11_PCBAVER)
                        $LblWDPCBAPN.text(pcb.SCC11_WDPCBAPN)
                        if ($LblWDPCBAPN.text() == 'NA') {
                            $LblWDPCBAPN.text(pcb.SCC11_TMPCBSN)
                        }
                    }
                }
                $LblM.text(item.M)
                $LblPRODCD.text(item.XXXX)
                $LblLINECD.text(item.L)
                $LblT.text(item.T)
                $LblD.text(item.D)
                $LblWW.text(item.WW)
                $LblYY.text(item.YY)

                return item.cResult
            } catch (e) {
                throw e
            }
        },
        getSmtLine: function(callback) {
            try {
                var $transport = {
                    aMode: 'getSMTLine',
                }
                this.$_ajax($transport).then(result => {
                    if (result.e) {
                        console.log(result.message)
                        return
                    }
                    var item = result.items[0]
                    $CmbSMTLINE.append($('<option>', {
                        value: item.SFC02_LINECD,
                        text: item.SFC02_LINECD
                    }))
                    callback()
                })
            } catch (e) {
                throw e
            }
        },
        checkInputStatus: function() {
            try {
                if ($QST10_ORDNO.val() != "" &&
                    $SCC11_TMPCBSN.val() != "" &&
                    $CmbSMTLINE.val() != "" &&
                    $TxtPANELQTY.val() != "" &&
                    $TxtPCBAQTY.val() != "" &&
                    $LblWDPCBAPN.text() != "" &&
                    $LblPRODCD.text() != "????") {

                    $lblResult.text('')
                    $TxtTOTAL.text(eval(this.$TxtPANELQTY.val()) * eval(this.$TxtPCBAQTY.val()))

                    if (eval($LblLOTQTY.text()) >= (eval($LblPRINTQTY.text()) + eval($TxtTOTAL.text()))) {
                        this.controlPartQty(qty => {
                            var len = BALANCE_apiTable.fnSettings().aoData.length
                            if (len < qty) {
                                $lblResult.css('background-color', 'red')
                                $lblResult.text('NOT READY !! PLEASE CHECK ALL PARTS CONTROL')
                            } else {
                                //this.$BtPRINT.focus()
                                $lblResult.css('background-color', 'green')
                                $lblResult.text('READY')
                                callback(true)
                            }
                        })
                    } else {
                        $lblResult.css('background-color', 'red')
                        $lblResult.text("PCBA OVER LOT Q'TY")
                        callback(false)
                    }
                } else {
                    callback(false)
                }
            } catch (e) {
                alert(e.message)
                throw e
            }
        },
        controlPartQty: function() {
            var $transport = {
                aMode: 'CONTROL_PART_QTY',
                QST10_ORDNO: $QST10_ORDNO.val(),
                SFC14_LINECD: $LblLINECD.text()
            }
            try {
                this.$_ajax($transport).then(result => {
                    callback(result.qty)
                })
            } catch (e) {
                throw e
            }
        },
        DispPartBalance: function(result) {
            try {
                BALANCE_apiTable.fnAddData(result)
            } catch (e) {
                alert(e.message)
                throw e
            }
        },
        $_ajax: function(transport) {
            try {
                var d = $.Deferred()
                $.ajax({
                    url: url,
                    method: 'GET',
                    data: transport,
                    contentType: "application/json;charset=UTF-8",
                    dataType: 'json',
                    success: function(response, status, xhr) {
                        d.resolve(response, status, xhr)
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        d.reject(errorThrown)
                    }
                })
            } catch (e) {
                throw e
            } finally {
                return d.promise()
            }
        },
    }
    $.fn.SFCAL1030 = function() {
        if (this.length === 1) {
            new $.SFCAL1030(this)
        }
        return this
    }
})(jQuery);

$(function() {
    //Now lets create objects
    var SFCAL1030 = $(document.body).find('form').SFCAL1030()
})