import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Deck {
    @PrimaryGeneratedColumn('increment', { name: 'id', comment: 'Deck Id' })
    id: number;

    @Column({ type: 'bool', name: 'deck_import', nullable: false, default: false, comment: 'Deck Import' })
    deckImport: boolean;

    @Column({name: 'deck_url', type: "varchar", length: 50, nullable : false, comment: 'Deck Url'})
    deckUrl: string;

    @Column({name: 'deck_name', type: "varchar", length: 50, nullable : true, comment: 'Deck Name'})
    deckName: string;

    @Column({name: 'commander', type: "varchar", length: 255, nullable : false, comment: 'Commander name'})
    commander: string;

    @Column({name: 'partner_commander', type: "varchar", length: 255, nullable : false, comment: 'Partner Commander Name'})
    partnerCommander: string;

    @Column({ type: 'smallint', name: 'active', nullable: false, default: 1, comment: 'Active Id' })
    active: number;

    @ManyToOne(() => User, (user) => user.decks, { onDelete: 'CASCADE' })
    user: User;
}
