$(document).ready(function() {
    // Data Katalog Produk Bawaan
    const products = [
        { id: 1, nama: "Bandana lucu", harga: 25000 },
        { id: 2, nama: "Tumbler sinchan", harga: 105000 },
        { id: 3, nama: "Totebag lily", harga: 75000 },
        { id: 4, nama: "Jedai korean Stile", harga: 55000 }
    ];

    let cart = [];

    // Render Produk ke Grid
    function renderProducts() {
        let html = '';
        products.forEach(p => {
            html += `
                <div class="product-item">
                    <div class="product-info">
                        <h4>${p.nama}</h4>
                        <span>Rp ${p.harga.toLocaleString('id-ID')}</span>
                    </div>
                    <button class="btn btn-purple btn-add" data-id="${p.id}">+ Tambah</button>
                </div>
            `;
        });
        $('#productGrid').html(html);
    }

    // --- LATIHAN 1: Update Cart UI & Diskon 10% jika total > Rp 100.000 ---
    function updateCartUI() {
        const cartList = $('#cartList');
        cartList.empty();

        if (cart.length === 0) {
            cartList.html('<p class="empty-cart">Keranjang masih kosong 🎀</p>');
            $('#cartQty').text('0 item');
            $('#cartTotal').html('Rp 0');
            $('#btnCheckout').prop('disabled', true);
            return;
        }

        let totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

        // Render daftar item di keranjang
        cart.forEach(item => {
            cartList.append(`
                <div class="cart-item">
                    <div class="cart-item-title">${item.nama}</div>
                    <div class="cart-item-controls">
                        <button class="btn-qty btn-minus" data-id="${item.id}">-</button>
                        <span>${item.qty}</span>
                        <button class="btn-qty btn-plus" data-id="${item.id}">+</button>
                        <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            `);
        });

        $('#cartQty').text(`${totalQty} item`);

        // LATIHAN 1 Logic Diskon
        if (totalHarga > 100000) {
            const diskon = totalHarga * 0.1;
            const totalSetelahDiskon = totalHarga - diskon;

            $('#cartTotal').html(`
                <div>
                    <span class="original-price">Rp ${totalHarga.toLocaleString('id-ID')}</span>
                    <span class="discounted-price">Rp ${totalSetelahDiskon.toLocaleString('id-ID')}</span>
                    <span class="badge-diskon">Diskon 10%</span>
                </div>
            `);
            // Simpan harga final di attribute untuk diakses saat checkout
            $('#cartTotal').data('finalTotal', totalSetelahDiskon);
        } else {
            $('#cartTotal').html(`Rp ${totalHarga.toLocaleString('id-ID')}`);
            $('#cartTotal').data('finalTotal', totalHarga);
        }

        $('#btnCheckout').prop('disabled', false);
    }

    // Handlers Tambah/Kurang Item Keranjang
    $(document).on('click', '.btn-add', function() {
        const id = $(this).data('id');
        const product = products.find(p => p.id === id);
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        updateCartUI();
    });

    $(document).on('click', '.btn-plus', function() {
        const id = $(this).data('id');
        const item = cart.find(i => i.id === id);
        if (item) item.qty++;
        updateCartUI();
    });

    $(document).on('click', '.btn-minus', function() {
        const id = $(this).data('id');
        const itemIndex = cart.findIndex(i => i.id === id);
        if (itemIndex !== -1) {
            if (cart[itemIndex].qty > 1) {
                cart[itemIndex].qty--;
            } else {
                cart.splice(itemIndex, 1);
            }
        }
        updateCartUI();
    });

    // --- LATIHAN 2: Simpan Riwayat ke localStorage & Render UI ---
    function simpanRiwayat(total, qty) {
        const riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
        riwayat.push({ tanggal: new Date().toISOString(), total, qty });
        localStorage.setItem('riwayat', JSON.stringify(riwayat));
        tampilkanRiwayat();
    }

    function tampilkanRiwayat() {
        const riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
        const tbody = $('#historyTableBody');
        tbody.empty();

        if (riwayat.length === 0) {
            tbody.append('<tr><td colspan="4" style="text-align:center; color:#9ca3af;">Belum ada riwayat transaksi</td></tr>');
            return;
        }

        riwayat.reverse().forEach((item, index) => {
            const tgl = new Date(item.tanggal).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            tbody.append(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${tgl}</td>
                    <td>${item.qty} item</td>
                    <td><strong>Rp ${item.total.toLocaleString('id-ID')}</strong></td>
                </tr>
            `);
        });
    }

    $('#btnClearHistory').click(function() {
        if (confirm("Apakah Anda yakin ingin menghapus semua riwayat transaksi?")) {
            localStorage.removeItem('riwayat');
            tampilkanRiwayat();
        }
    });

    // --- LATIHAN 3: Form Data Pembeli & Validasi Modal ---
    $('#btnCheckout').click(function() {
        if (cart.length > 0) {
            $('#checkoutModal').fadeIn(200);
        }
    });

    function closeModal() {
        $('#checkoutModal').fadeOut(200);
        $('#buyerForm')[0].reset();
        $('.error-text').hide();
    }

    $('#btnCloseModal, #btnCancelCheckout').click(closeModal);

    // Validasi & Submit Form Pembeli
    $('#buyerForm').submit(function(e) {
        e.preventDefault();
        let isValid = true;

        const nama = $('#buyerNama').val().trim();
        const noHP = $('#buyerNoHP').val().trim();
        const alamat = $('#buyerAlamat').val().trim();

        // Validasi Nama
        if (nama.length < 3) {
            $('#errBuyerNama').show();
            isValid = false;
        } else {
            $('#errBuyerNama').hide();
        }

        // Validasi No. HP (minimal 10 angka)
        const phonePattern = /^[0-9]{10,14}$/;
        if (!phonePattern.test(noHP)) {
            $('#errBuyerNoHP').show();
            isValid = false;
        } else {
            $('#errBuyerNoHP').hide();
        }

        // Validasi Alamat
        if (alamat.length < 5) {
            $('#errBuyerAlamat').show();
            isValid = false;
        } else {
            $('#errBuyerAlamat').hide();
        }

        // Jika semua validasi lulus
        if (isValid) {
            const finalTotal = $('#cartTotal').data('finalTotal') || 0;
            const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

            // Simpan ke localStorage (Latihan 2)
            simpanRiwayat(finalTotal, totalQty);

            alert(` Transaksi Berhasil! \n\nTerima kasih, ${nama}!\nPesanan Anda akan dikirim ke:\n${alamat}`);

            // Reset Cart & Close Modal
            cart = [];
            updateCartUI();
            closeModal();
        }
    });

    // Reset error text saat user mengetik
    $('#buyerNama, #buyerNoHP, #buyerAlamat').on('input', function() {
        $(this).next('.error-text').hide();
    });

    // Inisialisasi awal
    renderProducts();
    tampilkanRiwayat();
});