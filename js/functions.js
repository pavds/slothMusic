// Shuffle: перемешать элементы
$(function () {
	$.fn.shuffle = function () {
		var allElems = this.get(),
			getRandom = function (max) {
				return Math.floor(Math.random() * max);
			},
			shuffled = $.map(allElems, function () {
				var random = getRandom(allElems.length),
					randEl = $(allElems[random]).clone(true)[0];
				allElems.splice(random, 1);
				return randEl;
			});

		$(this).parent().html(shuffled);

		return $(shuffled);
	};
});

// Alphabetically: отсортировать элементы по алфавиту (d: направление сортировки)
$(function () {
	$.fn.alphabetically = function (d) {
		var $sort = this.get();

		$sort.sort(function (a, b) {
			var cA = $(a).text().toUpperCase();
			var cB = $(b).text().toUpperCase();
			return (d === '<') ? (cA < cB) ? -1 : 1 : (cA > cB) ? -1 : 1;
		});

		$(this).parent().html($sort);

		return $($sort);
	};
});

// clickToggle: выполняет функции по клику (поочередно)
$(function () {
	$.fn.clickToggle = function (a, b) {
		var ab = [b, a];

		function cb() {
			ab[this._tog ^= 1].call(this);
		}

		return this.on('click', cb);
	};
});
