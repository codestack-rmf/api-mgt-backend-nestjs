import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Deck } from "./deck.entity";
import { Answer } from "./answer.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment', { name: 'id', comment: 'User Id' })
    id: number;

    @Column({name: 'player_name', type: "varchar", length: 50, nullable : false, comment: 'Player Name'})
    playerName: string;

    @Column({ type: 'varchar', name: 'password', length: 255, nullable: true, comment: 'User Password' })
    password: string;

    @OneToMany(() => Deck, (deck) => deck.user, { cascade: true })
    decks: Deck[];

    @OneToOne(() => Answer, (answer) => answer.user)
    //@JoinColumn() // Especifica que esta tabla almacenará la clave foránea
    answer: Answer;

    @Column({name: 'player_experience', type: "smallint", nullable : false, comment: 'Deck Name'})
    playerExperience: number;

    @Column({name: 'overall_score', type: "float", nullable : false, comment: 'Deck Name'})
    overallScore: number;

    @Column({ type: 'smallint', name: 'active', nullable: false, default: 1, comment: 'Active Id' })
    active: number;
}
