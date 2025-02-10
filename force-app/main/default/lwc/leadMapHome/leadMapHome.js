import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getLeadLocations from '@salesforce/apex/LeadLocationController.getLeadLocations';
import LEAFLET_ZIP from '@salesforce/resourceUrl/LeafletJS';

export default class LeadMapHome extends LightningElement {
    @track leads = [];
    map;
    isLeafletLoaded = false;
    
    @wire(getLeadLocations)
    wiredLeads({ error, data }) {
        if (data) {
            this.leads = data;
            console.log('✅ 가져온 리드 데이터:', this.leads);
            if (this.isLeafletLoaded) {
                this.addMarkers();
            }
        } else if (error) {
            console.error('❌ 리드 데이터 로드 실패:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: '리드 데이터를 불러올 수 없습니다.',
                variant: 'error'
            }));
        }
    }

    renderedCallback() {
        if (this.isLeafletLoaded) return;

        Promise.all([
            loadStyle(this, LEAFLET_ZIP + '/leaflet.css'),
            loadScript(this, LEAFLET_ZIP + '/leaflet.js')
        ])
        .then(() => {
            console.log('✅ Leaflet.js 로드 성공');
            this.isLeafletLoaded = true;
            this.initMap();
        })
        .catch(error => {
            console.error('❌ Leaflet.js 로드 실패:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: '지도 라이브러리를 불러올 수 없습니다.',
                variant: 'error'
            }));
        });
    }

    initMap() {
        console.log('✅ 지도 초기화 시작');
        const mapContainer = this.template.querySelector('.map-container');
        if (!mapContainer) {
            console.error('❌ 지도 컨테이너를 찾을 수 없습니다.');
            return;
        }

        this.map = L.map(mapContainer).setView([37.5665, 126.9780], 12); // 서울 기본 중심 좌표
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.addMarkers();
    }

    addMarkers() {
        if (!this.map) return;

        this.leads.forEach(lead => {
            const lat = parseFloat(lead.Latitude__c);
            const lng = parseFloat(lead.Longitude__c);
            if (!isNaN(lat) && !isNaN(lng)) {
                L.marker([lat, lng]).addTo(this.map)
                    .bindPopup(`<b>${lead.Name}</b><br>${lead.Add__c}`)
                    .openPopup();
            }
        });
    }
}