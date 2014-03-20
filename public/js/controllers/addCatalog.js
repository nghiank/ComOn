'use strict';

angular.module('ace.catalog').controller('catalogController', ['CatalogAPI', 'formValidation', '$scope', 'Global', '$modal', function (CatalogAPI, formValidation, $scope, Global, $modal) {
	$scope.global = Global;
	$scope.formValidator = formValidation;
	$scope.uploadDisabled = true;
	$scope.xls = window.XLS;
	$scope.xlsx = window.XLSX;

	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.fileSelect = function($files) {
		var check = $scope.formValidator.checkFileExtension($files[0]?$files[0].name:'', ['xls']);
		if(check.result)
		{
			$scope.uploadDisabled = false;
			$scope.file = $files[0];
		}
		$scope.success = check.suc_message;
		$scope.valid = check.result;
		$scope.error = check.err_message;
	};

	$scope.populate = function() {
		var reader = new FileReader();
		reader.onload = function(){
			var wb = $scope.xls.read(reader.result, {type: 'binary'});
			$scope.startProcessing(wb);

		};
		reader.readAsBinaryString($scope.file);
	};

	$scope.getNextColumnToRead = function(column)
	{
		var length = column.join('').length;
		function repeatChar(count, ch) {
			if (count === 0) {
				return '';
			}
			var count2 = count / 2;
			var result = ch;
			while (result.length <= count2) {
				result += result;
			}
			var finalResult = result + result.substring(0, count - result.length);
			return finalResult;
		}
		function getNextAlphabet(char) {
			return String.fromCharCode(char.charCodeAt(0)+1);
		}
		var endString = repeatChar(length, 'Z');
		if(column.join('') === endString)
			return repeatChar(length+1, 'A');
		if(column[length - 1] === 'Z')
		{
			var index = 1;
			while(length >= index && column[length - index] === 'Z')
			{
				column[length-index] = 'A';
				if(length > index && column[length-index-1] === 'Z')
				{
					index++;
				}
				else
				{
					column[length-index-1] = getNextAlphabet(column[length-index-1]);
					break;
				}
			}
		}
		else
		{
			column[length-1] = getNextAlphabet(column[length-1])[0];
		}
		return column.join('');
	};

	$scope.startProcessing = function(wb) {
		var user = $scope.global.user;
		function checkAuthority(manufacturerEntry)
		{
			return user.isAdmin? true: (user.codeName.toLowerCase() === manufacturerEntry.toLowerCase());
		}
		function invalid_man() {
			return 'The codename in your profile does not match the manufacturer field in the sheet '+key+'.';
		}
		var json_obj = {};
		for (var key in wb.Sheets) {
			var sheet, sheet_data, row_data, columnFlag, rowFlag, column, row;
			if(wb.Sheets.hasOwnProperty(key))
			{
				sheet = wb.Sheets[key];
				sheet_data = [];
				row_data = {};
				columnFlag = true;
				rowFlag = true;
				column = 'A';
				row = 3;
				while(rowFlag)
				{
					if(!sheet['A'+row.toString()] || !sheet['A'+row.toString()].w)
					{
						rowFlag = false;
						break;
					}
					while(columnFlag)
					{
						if(!sheet[column+'2'] || !sheet[column+'2'].w)
						{
							columnFlag = false;
							break;
						}
						var column_title = sheet[column+'2'].w;
						if(!row_data[column_title.toLowerCase()])
						{
							var newCell = sheet[column+row.toString()]?sheet[column+row.toString()].w: '';
							if(column_title.toLowerCase() === 'manufacturer' && newCell !== '')
							{
								if(!checkAuthority(newCell))
								{
									$modal.open({
										templateUrl: 'views/errorAlertModal.html',
										controller: 'errorAlertModalCtrl',
										resolve: {
											message: invalid_man
										}
									});
									return;
								}
							}
							row_data[column_title.toLowerCase()] = newCell;
						}
						column = $scope.getNextColumnToRead(column.split(''));
						if(!column)
						{
							columnFlag = false;
							break;
						}
					}
					columnFlag = true;
					column = 'A';
					row+=1;
					if(row_data)
						sheet_data.push(row_data);
					row_data = {};
				}
				json_obj[key] = {title: sheet.A1? sheet.A1.w: '', data: sheet_data};
				sheet_data = [];
			}
		}
		CatalogAPI.updateCatalog.save({data: json_obj}, function(response) {
			if(response)
			{
				console.log('Catalog Updated');
			}
		});
	};

}]);